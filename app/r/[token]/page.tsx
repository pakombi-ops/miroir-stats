import { createAdminClient } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'

export default async function ShareRevealPage({ params }: { params: { token: string } }) {
  const supabase = await createAdminClient()
  
  const { data: share } = await supabase
    .from('share_tokens')
    .select('*')
    .eq('token', params.token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!share) {
    redirect('/')
  }

  // Incrémenter les vues
  await supabase
    .from('share_tokens')
    .update({ views: share.views + 1 })
    .eq('token', params.token)

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-[#a3e635] text-sm font-bold tracking-widest mb-4">MIROIR MIROIR</p>
      
      <h1 className="text-white text-2xl font-bold mb-2">
        Quelqu'un a partagé son ratio avec toi
      </h1>
      
      <div className="my-8 p-6 border border-[#222] rounded-2xl">
        <p className="text-[#888] text-sm mb-2">Son ratio d'exigence est...</p>
        {/* Flou volontaire — révélé après inscription */}
        <div className="relative">
          <p className="text-8xl font-bold text-white blur-md select-none">
            {share.sender_ratio}x
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[#a3e635] font-bold text-lg">🔒 Inscris-toi pour voir</p>
          </div>
        </div>
      </div>
      
      <p className="text-[#888] mb-8 max-w-sm">
        "{share.viral_phrase}"
      </p>
      
      <a 
        href={`/login?redirect=/r/${params.token}&reveal=true`}
        className="bg-[#a3e635] text-black font-bold py-4 px-8 rounded-full text-lg"
      >
        Voir son ratio et calculer le mien →
      </a>
      
      <p className="text-[#444] text-xs mt-6">
        Cette révélation expire dans 7 jours · mystandards.app
      </p>
    </div>
  )
}