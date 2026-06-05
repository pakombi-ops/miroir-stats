if (action === 'verify') {
  const adminSupabase = await createAdminClient()
  
  // Vérifie le code dans notre table
  const { data: otpData, error: otpError } = await adminSupabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('code', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (otpError || !otpData) {
    return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 })
  }

  // Crée la session directement via admin
  const { data: userData } = await adminSupabase.auth.admin.getUserByEmail(email)
  
  let userId = userData?.user?.id

  // Si l'utilisateur n'existe pas encore, le créer
  if (!userId) {
    const { data: newUser } = await adminSupabase.auth.admin.createUser({
      email,
      email_confirm: true
    })
    userId = newUser?.user?.id
  } else {
    // Confirme l'email si pas encore confirmé
    await adminSupabase.auth.admin.updateUserById(userId, {
      email_confirm: true
    })
  }

  // Génère un lien de connexion pour créer la session
  const { data: linkData } = await adminSupabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  // Supprime le code utilisé
  await adminSupabase.from('otp_codes').delete().eq('email', email)

  const actionLink = linkData?.properties?.action_link

  return NextResponse.json({ success: true, actionLink })
}