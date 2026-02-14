import Link from "next/link";
import Footer from "@/components/ui/footer";
import { redirect } from "next/navigation";

export default async function Home() {
  redirect("/landing");
}
