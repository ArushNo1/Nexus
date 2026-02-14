import Link from "next/link";
import Footer from "@/components/ui/footer";
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/create");
}
