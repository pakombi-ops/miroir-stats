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
            <li>Avec votre consentement séparé, vous proposer du contenu et des offres liés à Pilier Conscient (voir section 6)</li>
          </ul>
        </Section>

        <Section title="4. Base légale">
          <p>Le traitement est fondé sur :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>L'exécution du contrat (fourniture du service)</li>
            <li>Le consentement de l'utilisateur (inscription volontaire, et consentement spécifique pour le traitement des données sensibles et pour le funnel Pilier Conscient)</li>
            <li>L'intérêt légitime (sécurité et amélioration du service)</li>
          </ul>
        </Section>

        <Section title="5. Données sensibles">
          <p>Certains critères saisis par l'utilisateur (origine ethnique, religion) constituent des données sensibles au sens du RGPD (article 9). Ces données sont traitées uniquement sur la base de votre consentement explicite, recueilli avant la saisie de ces critères, dans le seul but de calculer les estimations statistiques demandées par le service.</p>
          <p>Ces données sensibles sont transmises à notre prestataire d'intelligence artificielle (Anthropic, voir section 6) pour générer votre analyse, dans le cadre d'un accord de traitement de données (DPA) garantissant leur confidentialité. Elles ne sont jamais vendues, ni partagées à des fins publicitaires ou commerciales, ni utilisées pour entraîner des modèles d'IA tiers.</p>
          <p>Vous pouvez à tout moment refuser de renseigner ces critères : dans ce cas, l'estimation portera uniquement sur les critères non sensibles que vous avez fournis.</p>
        </Section>

        <Section title="6. Partage des données">
          <p>Les données sont partagées uniquement avec les destinataires suivants, chacun agissant comme sous-traitant dans le cadre de la fourniture du service :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong style={{color:'#e5e2dd'}}>Supabase</strong> — hébergement de la base de données et authentification (USA, encadré par des clauses contractuelles types - CCT)</li>
            <li><strong style={{color:'#e5e2dd'}}>Vercel</strong> — hébergement du service et analytics (USA, encadré par des CCT)</li>
            <li><strong style={{color:'#e5e2dd'}}>Stripe</strong> — traitement des paiements (USA, certifié PCI-DSS, encadré par des CCT)</li>
            <li><strong style={{color:'#e5e2dd'}}>Anthropic</strong> — génération des analyses via API IA (USA, encadré par un accord de traitement de données - DPA - et des CCT ; les données ne sont pas utilisées pour entraîner les modèles d'Anthropic)</li>
            <li><strong style={{color:'#e5e2dd'}}>Resend</strong> — envoi des emails transactionnels (encadré par des CCT)</li>
          </ul>

          <p><strong style={{color:'#e5e2dd'}}>Pilier Conscient (programme du même responsable de traitement)</strong><br/>
          Si vous y consentez explicitement (case à cocher dédiée, non pré-cochée), votre adresse email peut être transmise à la plateforme d'emailing utilisée par Pilier Conscient (Systeme.io) afin de vous adresser des contenus et offres liés à ce programme. Ce consentement est totalement indépendant de l'utilisation de MiroirStats et peut être retiré à tout moment via le lien de désinscription présent dans chaque email, ou en nous contactant.</p>

          <p>Aucune donnée n'est vendue à des tiers.</p>
        </Section>

        <Section title="7. Durée de conservation">
          <p>Les données sont conservées :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li>Données de compte : jusqu'à suppression du compte par l'utilisateur</li>
            <li>Historique des analyses (y compris critères sensibles) : 2 ans à compter de la dernière activité, ou suppression anticipée sur simple demande</li>
            <li>Données de paiement : 5 ans (obligation légale comptable)</li>
            <li>Email transmis à Pilier Conscient (si consentement donné) : jusqu'au retrait du consentement ou désinscription</li>
          </ul>
        </Section>

        <Section title="8. Âge minimum">
          <p>MiroirStats est réservé aux personnes âgées de 18 ans ou plus. En créant un compte, vous confirmez avoir au moins 18 ans. Nous ne collectons pas sciemment de données concernant des mineurs. Si vous pensez qu'un mineur a créé un compte, contactez-nous à <a href="mailto:support@mystandards.app" style={{color:'#C8FF00'}}>support@mystandards.app</a> afin que nous procédions à sa suppression.</p>
        </Section>

        <Section title="9. Droits des utilisateurs">
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong style={{color:'#e5e2dd'}}>Accès</strong> — obtenir une copie de vos données</li>
            <li><strong style={{color:'#e5e2dd'}}>Rectification</strong> — corriger vos données</li>
            <li><strong style={{color:'#e5e2dd'}}>Effacement</strong> — supprimer votre compte et vos données</li>
            <li><strong style={{color:'#e5e2dd'}}>Portabilité</strong> — exporter vos données</li>
            <li><strong style={{color:'#e5e2dd'}}>Opposition</strong> — vous opposer à certains traitements, notamment au traitement des données sensibles ou au partage avec Pilier Conscient</li>
            <li><strong style={{color:'#e5e2dd'}}>Retrait du consentement</strong> — à tout moment, sans affecter la licéité des traitements antérieurs</li>
          </ul>
          <p>Pour exercer ces droits : <a href="mailto:support@mystandards.app" style={{color:'#C8FF00'}}>support@mystandards.app</a></p>
          <p>Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" style={{color:'#C8FF00'}}>www.cnil.fr</a></p>
        </Section>

        <Section title="10. Cookies">
          <p>MiroirStats utilise uniquement des cookies techniques nécessaires au fonctionnement du service (session d'authentification). Aucun cookie publicitaire ou de tracking n'est utilisé.</p>
        </Section>

        <Section title="11. Sécurité">
          <p>Les données sont protégées par chiffrement en transit (HTTPS/TLS) et au repos. L'accès aux données est limité au strict nécessaire. Les mots de passe ne sont pas stockés — l'authentification se fait par magic link ou code OTP.</p>
        </Section>

        <Section title="12. Modifications">
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
