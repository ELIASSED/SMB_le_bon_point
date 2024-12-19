Enum Civilite {
  Monsieur
  Madame
}

Table User {
  id        int       [pk, increment]
  email     varchar   [unique]
  firstName varchar
  lastName  varchar
  phone     varchar
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]
}

Table Session {
  id                   int       [pk, increment]
  numeroStageAnts      varchar
  description          varchar
  startDate            timestamp
  endDate              timestamp
  location             varchar
  capacity             int
  createdAt            timestamp [default: `now()`]
  updatedAt            timestamp [default: `now()`]
  instructorId         int
  psychologueId        int       // New field to link to Psychologue
}

Table Nationalite {
  id   int      [pk, increment]
  name varchar [unique]
}

Table Inscription {
  id             int       [pk, increment]
  civilite       varchar   // Replacer enum par varchar ici
  nom            varchar
  prenom         varchar
  adresse        varchar
  codePostal     varchar
  ville          varchar
  telephone      varchar
  email          varchar
  stage          varchar
  nationalite    int       // Changed from varchar to int to reference Nationalite.id
  dateNaissance  timestamp
  idCard         varchar
  permis         varchar
  sessionId      int       // New field to link to Session
  createdAt      timestamp [default: `now()`]
}

Table Instructor {
  id        int       [pk, increment]
  email     varchar   [unique]
  firstName varchar
  lastName  varchar
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]
}

Table Psychologue { // New Psychologue table
  id        int       [pk, increment]
  email     varchar   [unique]
  firstName varchar
  lastName  varchar
  createdAt timestamp [default: `now()`]
  updatedAt timestamp [default: `now()`]
}

Table Payment {
  id             int      [pk, increment]
  InscriptionId  int
  amount         float
  method         varchar
  paidAt         timestamp [default: `now()`]
}

// Define references separately
Ref: Session.instructorId > Instructor.id
Ref: Session.psychologueId > Psychologue.id // New reference
Ref: Payment.InscriptionId > Inscription.id
Ref: Inscription.sessionId > Session.id
Ref: Inscription.nationalite > Nationalite.id
