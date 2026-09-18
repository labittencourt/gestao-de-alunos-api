import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAsAdmin, loginAsUser } from './helpers/auth.js';
import { testCredentials } from './config.js';

describe('EP-001 - POST /api/auth/login', () => {
  it('TC-B001 - login valido de administrador', async () => {
    const resposta = await loginAsAdmin(request(app));

    expect(resposta.status).to.equal(200);
    expect(resposta.body.token).to.be.a('string').and.not.empty;
    expect(resposta.body.usuario).to.include({ email: testCredentials.admin.email, role: 'admin' });
    expect(resposta.body.usuario).to.have.all.keys('id', 'nome', 'email', 'role');
  });

  it('TC-B002 - login valido de aluno', async () => {
    const resposta = await loginAsUser(request(app), testCredentials.student);

    expect(resposta.status).to.equal(200);
    expect(resposta.body.token).to.be.a('string').and.not.empty;
    expect(resposta.body.usuario).to.include({ email: testCredentials.student.email, role: 'aluno' });
    expect(resposta.body.usuario).to.have.all.keys('id', 'nome', 'email', 'role');
  });

  it('TC-B003 - campos obrigatorios ausentes', async () => {
    for (const payload of [{}, { email: testCredentials.admin.email }, { senha: testCredentials.admin.senha }]) {
      const resposta = await request(app).post('/api/auth/login').send(payload);

      expect(resposta.status).to.equal(400);
      expect(resposta.body.error).to.equal('Os campos "email" e "senha" são obrigatórios.');
    }
  });

  it('TC-B004 - credenciais invalidas', async () => {
    const casos = [
      { email: testCredentials.unknownEmail, senha: testCredentials.admin.senha },
      { email: testCredentials.admin.email, senha: testCredentials.invalidPassword },
      { email: testCredentials.unknownEmail, senha: testCredentials.invalidPassword },
    ];

    for (const credenciais of casos) {
      const resposta = await request(app).post('/api/auth/login').send(credenciais);

      expect(resposta.status).to.equal(401);
      expect(resposta.body.error).to.equal('E-mail ou senha inválidos.');
    }
  });

  it('TC-B005 - nao exposicao de senha ou hash', async () => {
    const resposta = await loginAsAdmin(request(app));
    const corpo = JSON.stringify(resposta.body);

    expect(corpo).to.not.include(testCredentials.admin.senha);
    expect(corpo).to.not.include('senha');
    expect(resposta.body.usuario).to.not.have.property('senha');
    expect(resposta.body.usuario).to.not.have.property('password');
  });

  it('TC-B006 - contrato de sucesso, token e usuario', async () => {
    const resposta = await loginAsAdmin(request(app));

    expect(resposta.status).to.equal(200);
    expect(resposta.headers['content-type']).to.match(/json/);
    expect(resposta.body).to.have.all.keys('token', 'usuario');
    expect(resposta.body.token).to.be.a('string').and.not.empty;
    expect(resposta.body.usuario.id).to.be.a('string').and.not.empty;
    expect(resposta.body.usuario.nome).to.be.a('string').and.not.empty;
    expect(resposta.body.usuario.email).to.equal(testCredentials.admin.email);
    expect(resposta.body.usuario.role).to.equal('admin');
  });

  it.skip('TC-B007 - falha interna sanitizada', async () => {
    // BLOQUEADO - docs/coverage/EP-001-coverage-gaps.md G-EP001-007:
    // ainda não existe mecanismo definido para simular falha de dependência.
  });

  it.skip('TC-B008 - valores nulos, vazios e campos extras', async () => {
    // BLOQUEADO - docs/coverage/EP-001-coverage-gaps.md G-EP001-001:
    // comportamento esperado para nulos, vazios e extras não foi confirmado.
  });

  it.skip('TC-B009 - formato, limites, espacos e Unicode', async () => {
    // BLOQUEADO - docs/coverage/EP-001-coverage-gaps.md G-EP001-002/G-EP001-003:
    // formato, limites e normalização ainda não foram confirmados.
  });

  it.skip('TC-B010 - abuso, desempenho e concorrencia', async () => {
    // BLOQUEADO - docs/coverage/EP-001-coverage-gaps.md G-EP001-010/G-EP001-012:
    // política de abuso, métricas e limites de concorrência não foi definida.
  });
});