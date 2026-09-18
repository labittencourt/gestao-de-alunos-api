import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAsUser } from './helpers/auth.js';

describe('Autorização e isolamento dos dados', () => {
  it('deve rejeitar uma rota administrativa sem token', async () => {
    const resposta = await request(app).get('/api/admin/alunos');

    expect(resposta.status).to.equal(401);
    expect(resposta.body.error).to.equal('Token de autenticação não informado.');
  });

  it('não deve permitir que um aluno consulte dados de outro aluno', async () => {
    const login = await loginAsUser(request(app), {
      email: 'ana.souza@example.com',
      senha: '123456',
    });

    const resposta = await request(app)
      .get('/api/alunos/aluno-bruno-lima/notas')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(resposta.status).to.equal(403);
    expect(resposta.body.error).to.equal('Você só pode acessar os seus próprios dados.');
  });

  it('não deve aceitar entrega em disciplina em que o aluno não está matriculado', async () => {
    const login = await loginAsUser(request(app), {
      email: 'ana.souza@example.com',
      senha: '123456',
    });

    const resposta = await request(app)
      .post('/api/alunos/aluno-ana-souza/trabalhos')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({
        disciplinaId: 'disciplina-historia',
        titulo: 'Entrega indevida',
      });

    expect(resposta.status).to.equal(409);
    expect(resposta.body.error).to.equal('O aluno não está matriculado nesta disciplina.');
  });
});