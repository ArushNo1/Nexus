// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("type") as string; // "code", "video", or "audio"
    const materialId = formData.get("material_id") as string | null;
    console.log("Received request with file:", file);
    console.log("File type:", fileType);
    console.log("Material ID:", materialId);

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!fileType || !["code", "video", "audio"].includes(fileType)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid file type. Must be 'code', 'video', or 'audio'",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Determine bucket name
    const bucketMap: Record<string, string> = {
      code: "code",
      video: "videos",
      audio: "audios",
    };
    const bucketName = bucketMap[fileType];

    // Get file extension
    const fileName = file.name;
    const ext = fileName.substring(fileName.lastIndexOf(".") + 1) || "bin";

    let finalMaterialId = materialId;

    // If no material_id provided, create a new materials entry
    if (!finalMaterialId) {
      const { data, error } = await supabase
        .from("materials")
        .insert({ type: fileType })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating material entry:", error);
        return new Response(
          JSON.stringify({
            error: "Failed to create material entry",
            details: error.message,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      finalMaterialId = data.id;
    }

    // Upload file to bucket
    const filePath = `${finalMaterialId}.${ext}`;
    const fileBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading file:", uploadError);
      return new Response(
        JSON.stringify({
          error: "Failed to upload file",
          details: uploadError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        material_id: finalMaterialId,
        bucket: bucketName,
        file_path: filePath,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});