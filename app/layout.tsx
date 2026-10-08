import type { Metadata } from "next";
import { Archivo, Geist, Instrument_Serif } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "./globals.css";

// Geist : la police de tout le site (propre, moderne, proche de celle d'Apple)
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

// Archivo : uniquement pour le logo, en version "élargie" (axe wdth)
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

// Instrument Serif en italique : pour les petits mots élégants ("Every time.")
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

// Les infos que Google affiche. Chaque page peut écraser le "title".
// "%s" est remplacé par le titre de la page : "Services | Ryonne Auto Glass"
export const metadata: Metadata = {
  title: {
    default: "Ryonne Auto Glass | Windshield Repair & Replacement in Columbus, OH",
    template: "%s | Ryonne Auto Glass",
  },
  description:
    "Expert windshield replacement, rock chip repair and ADAS recalibration in Columbus, Ohio. 17 years of experience. Mobile or in-shop service.",
};

// Le layout entoure TOUTES les pages : la barre du haut et le pied de page
// sont donc écrits une seule fois ici, et {children} = la page affichée.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${archivo.variable} ${instrument.variable}`}>
      <body className="font-sans">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
