export async function loginAsAdmin(client, credentials = {
  email: 'admin@escola.com',
  senha: 'admin123',
}) {
  const response = await client
    .post('/api/auth/login')
    .send(credentials);

  return response;
}

export async function loginAsUser(client, credentials) {
  const response = await client
    .post('/api/auth/login')
    .send(credentials);

  return response;
}