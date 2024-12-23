/**
 * Génère un template d'email HTML pour confirmer l'inscription d'un utilisateur à un stage.
 * @param prenom - Le prénom de l'utilisateur
 * @param nom - Le nom de l'utilisateur
 * @param stageLocation - Le lieu du stage
 * @param stageNumero - Le numéro préfectoral du stage
 * @param startDate - La date de début du stage (en texte déjà formaté)
 * @param endDate - La date de fin du stage (en texte déjà formaté)
 * @param contactEmail - Un e-mail de contact (optionnel)
 * @param contactPhone - Un numéro de téléphone de contact (optionnel)
 */
export function generateConfirmationEmail(
    prenom: string,
    nom: string,
    stageLocation: string,
    stageNumero: string,
    startDate: string,
    endDate: string,
    contactEmail?: string,
    contactPhone?: string
  ): string {
    return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <title>Confirmation d'inscription</title>
    <style>
      /* Exemple de styles inline simples */
      body {
        font-family: Arial, sans-serif;
        background-color: #f6f6f6;
        margin: 0;
        padding: 0;
      }
      .container {
        background-color: #ffffff;
        max-width: 600px;
        margin: 40px auto;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid #e2e2e2;
      }
      .header {
        background-color: #508CA4;
        color: #ffffff;
        text-align: center;
        padding: 20px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .content {
        padding: 20px;
        color: #333333;
      }
      .footer {
        background-color: #f2f2f2;
        color: #333333;
        text-align: center;
        padding: 10px;
        font-size: 12px;
      }
      .btn {
        display: inline-block;
        background-color: #508CA4;
        color: #ffffff;
        padding: 12px 20px;
        margin: 20px 0;
        text-decoration: none;
        font-weight: bold;
        border-radius: 4px;
      }
      .stage-info {
        background-color: #fafafa;
        border: 1px solid #eeeeee;
        padding: 15px;
        margin-top: 10px;
        border-radius: 4px;
      }
      .stage-info p {
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Confirmation d'inscription</h1>
      </div>
      <div class="content">
        <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
        <p>
          Nous sommes ravis de vous confirmer votre inscription pour le stage
          suivant :
        </p>
  
        <div class="stage-info">
          <p><strong>Lieu :</strong> ${stageLocation}</p>
          <p><strong>Numéro de stage préfectoral :</strong> ${stageNumero}</p>
          <p><strong>Dates :</strong> du ${startDate} au ${endDate}</p>
        </div>
  
        <p>
          Veuillez conserver cet e-mail comme preuve de votre inscription et
          apporter les documents nécessaires le jour du stage.
        </p>
  
        <a href="#" class="btn">Accéder à mon espace</a>
  
        <p>
          En cas de besoin, n'hésitez pas à nous contacter
          ${contactEmail ? `par email : <a href="mailto:${contactEmail}">${contactEmail}</a>` : ""}
          ${contactPhone ? `ou par téléphone : <strong>${contactPhone}</strong>` : ""}.
        </p>
  
        <p>Merci encore de votre confiance et à très bientôt !</p>
  
        <p>Cordialement,<br/>
        L'équipe d'organisation</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} - Tous droits réservés</p>
      </div>
    </div>
  </body>
  </html>
    `;
  }
  