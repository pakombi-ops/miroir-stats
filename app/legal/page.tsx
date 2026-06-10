'use client'
import { useRouter } from 'next/navigation'

export default function LegalPage() {
  const router = useRouter()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0F', padding: '24px', maxWidth: '680px', margin: '0 auto' }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', paddingTop: '16px' }}>
        <button onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#8e9479', cursor: 'pointer', fontSize: '24px', padding: 0 }}>
          ‹
        </button>
        <h1 style={{ fontFamily: 'Syne', fontSize: '22px', fontWeight: 800, color: '#e5e2dd', margin: 0 }}>
          Mentions légales & CGU
        </h1>
      </div>

      <div style={{ fontFamily: 'DM Sans', fontSize: '15px', color: '#8e9479', lineHeight: '1.8' }}>

        <Section title="Mentions légales">
          <p><strong style={{color:'#e5e2dd'}}>Éditeur du service</strong><br/>
          MiroirStats est un service édité par Prince Johann Akombi Nzaou, particulier domicilié en France.<br/>
          Contact : <a href="mailto:support@mystandards.app" style={{color:'#C8FF00'}}>support@mystandards.app</a></p>

          <p><strong style={{color:'#e5e2dd'}}>Hébergement</strong><br/>
          Le service est hébergé par Vercel Inc., 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis.<br/>
          La base de données est hébergée par Supabase Inc.</p>

          <p><strong style={{color:'#e5e2dd'}}>Directeur de la publication</strong><br/>
          Prince Johann Akombi Nzaou</p>
        </Section>

        <Section title="Conditions Générales d'Utilisation">
          <p><strong style={{color:'#e5e2dd'}}>1. Objet</strong><br/>
          MiroirStats (accessible sur mystandards.app) est une application web et mobile permettant à l'utilisateur d'estimer le pourcentage de la population mondiale correspondant à ses critères de recherche de partenaire, ainsi que le pourcentage qu'il représente lui-même. L'écart entre ces deux valeurs génère un "ratio d'exigence".</p>

          <p><strong style={{color:'#e5e2dd'}}>2. Accès au service</strong><br/>
          L'accès au service nécessite la création d'un compte via une adresse email. L'inscription est gratuite et inclut 3 crédits offerts. Chaque analyse consomme 1 crédit.</p>

          <p><strong style={{color:'#e5e2dd'}}>3. Système de crédits</strong><br/>
          Les crédits sont achetés sous forme de packs non remboursables. Les crédits n'ont pas de date d'expiration. Aucun abonnement n'est proposé. Les paiements sont traités par Stripe et sécurisés.</p>

          <p><strong style={{color:'#e5e2dd'}}>4. Données et résultats</strong><br/>
          Les résultats fournis sont des estimations statistiques basées sur des données démographiques mondiales. Ils ne constituent pas une vérité scientifique absolue et sont fournis à titre indicatif et de divertissement. L'éditeur ne garantit pas l'exactitude des résultats.</p>

          <p><strong style={{color:'#e5e2dd'}}>5. Propriété intellectuelle</strong><br/>
          L'ensemble des éléments du service (design, code, algorithmes, contenu) est la propriété exclusive de l'éditeur. Toute reproduction ou utilisation sans autorisation est interdite.</p>

          <p><strong style={{color:'#e5e2dd'}}>6. Limitation de responsabilité</strong><br/>
          L'éditeur ne saurait être tenu responsable de l'utilisation faite des résultats par l'utilisateur. Le service est fourni "tel quel", sans garantie de disponibilité permanente.</p>

          <p><strong style={{color:'#e5e2dd'}}>7. Remboursements</strong><br/>
          Les crédits achetés ne sont pas remboursables sauf en cas de dysfonctionnement technique avéré. Toute demande de remboursement doit être adressée à support@mystandards.app dans les 14 jours suivant l'achat.</p>

          <p><strong style={{color:'#e5e2dd'}}>8. Modification des CGU</strong><br/>
          L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email en cas de modification substantielle.</p>

          <p><strong style={{color:'#e5e2dd'}}>9. Droit applicable</strong><br/>
          Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.</p>

          <p><strong style={{color:'#e5e2dd'}}>10. Contact</strong><br/>
          Pour toute question : <a href="mailto:support@mystandards.app" style={{color:'#C8FF00'}}>support@mystandards.app</a></p>
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