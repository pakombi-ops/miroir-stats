'use client'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F', padding: '24px', maxWidth: '680px', margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingTop: '16px' }}>
        <button onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#8e9479', cursor: 'pointer', fontSize: '24px', padding: 0 }}>
          ‹
        </button>
        <h1 style={{ fontFamily: 'Syne', fontSize: '22px', fontWeight: 800, color: '#e5e2dd', margin: 0 }}>
          Politique de confidentialité
        </h1>
      </div>

      <div style={{ fontFamily: 'DM Sans', fontSize: '15px', color: '#8e9479', lineHeight: '1.8' }}>

        <Section title="1. Responsable du traitement">
          <p>Prince Johann Akombi Nzaou, particulier domicilié en France.<br/>
          Contact DPO : <a href="mailto:support@mystandards.app" style={{color:'#C8FF00'}}>support@mystandards.app</a></p>
        </Section>

        <Section title="2. Données collectées">
          <p><strong style={{color:'#e5e2dd'}}>Données d'identification</strong><br/>
          Adresse email (fournie lors de l'inscription via magic link ou code OTP).</p>

          <p><strong style={{color:'#e5e2dd'}}>Données d'utilisation</strong><br/>
          Critères de recherche saisis (genre, âge, taille, revenu, origine ethnique, religion, etc.), résultats d'analyses, historique des analyses, solde de crédits.</p>

          <p><strong style={{color:'#e5e2dd'}}>Données de paiement</strong><br/>
          Les paiements sont traités par Stripe. MiroirStats ne stocke aucune donnée bancaire. Seul l'identifiant de transaction Stripe est conservé.</p>

          <p><strong style={{color:'#e5e2dd'}}>Données techniques</strong><br/>
          Adresse IP, type d'appareil, système d'exploitation (collectés automatiquement par Vercel et Supabase pour la sécurité du service).</p>
        </Section>

        <Section title="3. Finalités du traitement">
          <p>Les données sont collectées pour :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Fournir le service d'analyse démographique</li>
            <li>Gérer les comptes utilisateurs et les crédits</li>
            <li>Traiter les paiements</li>
            <li>Améliorer le service</li>
            <li>Envoyer des communications transactionnelles (confirmation d'inscription, codes OTP)</li>
          </ul>
        </Section>

        <Section title="4. Base légale">
          <p>Le traitement est fondé sur :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>L'exécution du contrat (fourniture du service)</li>
            <li>Le consentement de l'utilisateur (inscription volontaire)</li>
            <li>L'intérêt légitime (sécurité et amélioration du service)</li>
          </ul>
        </Section>

        <Section title="5. Données sensibles">
          <p>Certains critères saisis par l'utilisateur (origine ethnique, religion) constituent des données sensibles au sens du RGPD. Ces données sont traitées uniquement sur la base du consentement explicite de l'utilisateur, dans le seul but de calculer les estimations statistiques demandées. Elles ne sont jamais partagées avec des tiers.</p>
        </Section>

        <Section title="6. Partage des données">
          <p>Les données sont partagées uniquement avec :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong style={{color:'#e5e2dd'}}>Supabase</strong> — hébergement de la base de données (USA, couvert par les clauses contractuelles types)</li>
            <li><strong style={{color:'#e5e2dd'}}>Vercel</strong> — hébergement du service (USA, couvert par les clauses contractuelles types)</li>
            <li><strong style={{color:'#e5e2dd'}}>Stripe</strong> — traitement des paiements (USA, certifié PCI-DSS)</li>
            <li><strong style={{color:'#e5e2dd'}}>Anthropic</strong> — génération des analyses via API IA (USA, données pseudonymisées)</li>
            <li><strong style={{color:'#e5e2dd'}}>Resend</strong> — envoi des emails transactionnels</li>
          </ul>
          <p>Aucune donnée n'est vendue à des tiers.</p>
        </Section>

        <Section title="7. Durée de conservation">
          <p>Les données sont conservées :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Données de compte : jusqu'à suppression du compte par l'utilisateur</li>
            <li>Historique des analyses : 2 ans</li>
            <li>Données de paiement : 5 ans (obligation légale)</li>
          </ul>
        </Section>

        <Section title="8. Droits des utilisateurs">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong style={{color:'#e5e2dd'}}>Accès</strong> — obtenir une copie de vos données</li>
            <li><strong style={{color:'#e5e2dd'}}>Rectification</strong> — corriger vos données</li>
            <li><strong style={{color:'#e5e2dd'}}>Effacement</strong> — supprimer votre compte et vos données</li>
            <li><strong style={{color:'#e5e2dd'}}>Portabilité</strong> — exporter vos données</li>
            <li><strong style={{color:'#e5e2dd'}}>Opposition</strong> — vous opposer à certains traitements</li>
          </ul>
          <p>Pour exercer ces droits : <a href="mailto:support@mystandards.app" style={{color:'#C8FF00'}}>support@mystandards.app</a></p>
          <p>Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" style={{color:'#C8FF00'}}>www.cnil.fr</a></p>
        </Section>

        <Section title="9. Cookies">
          <p>MiroirStats utilise uniquement des cookies techniques nécessaires au fonctionnement du service (session d'authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
        </Section>

        <Section title="10. Sécurité">
          <p>Les données sont protégées par chiffrement en transit (HTTPS/TLS) et au repos. L'accès aux données est limité au strict nécessaire. Les mots de passe ne sont pas stockés — l'authentification se fait par magic link ou code OTP.</p>
        </Section>

        <Section title="11. Modifications">
          <p>Cette politique peut être mise à jour. Les utilisateurs seront informés par email en cas de modification substantielle.</p>
        </Section>

        <p style={{ fontSize: '12px', opacity: 0.4, marginTop: '40px', textAlign: 'center' }}>
          Dernière mise à jour : juin 2026
        </p>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h2 style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, color: '#C8FF00', marginBottom: '16px' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}