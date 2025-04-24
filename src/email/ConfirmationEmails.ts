// src/emails/ConfirmationEmail.tsx
import { Button, Html, Text, Heading } from "@react-email/components";

interface ConfirmationEmailProps {
  prenom: string;
  nom: string;
  location: string;
  numeroStageAnts: string;
  startDate: string;
  endDate: string;
  supportEmail: string;
  supportPhone: string;
}

export default function ConfirmationEmail({
  prenom,
  nom,
  location,
  numeroStageAnts,
  startDate,
  endDate,
  supportEmail,

}: ConfirmationEmailProps) {
  return (
    <Html>
      <Heading>Confirmation de votre inscription</Heading>
      <Text>Bonjour {prenom} {nom},</Text>
      <Text>Votre inscription au stage est confirmée !</Text>
      <Text>
        <strong>Lieu :</strong> {location}<br />
        <strong>Numéro du stage :</strong> {numeroStageAnts}<br />
        <strong>Dates :</strong> Du {startDate} au {endDate}
      </Text>
      <Text>
        Pour toute question, contactez-nous à <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
      </Text>
      <Button href="https://votre-domaine.com/success" style={{ background: "#4f46e5", color: "white", padding: "10px 20px" }}>
        Voir les détails
      </Button>
    </Html>
  );
}