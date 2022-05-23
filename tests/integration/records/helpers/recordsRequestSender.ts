import * as supertest from 'supertest';

export class RecordsRequestSender {
  public constructor(private readonly app: Express.Application) {}

  public async recordExists(id: string): Promise<supertest.Response> {
    return supertest.agent(this.app).get(`/records/exists/${id}`);
  }

  public async createResource(body: Record<string, unknown>): Promise<supertest.Response> {
    return supertest.agent(this.app).post(`/records`).set('Content-Type', 'application/json').send(body);
  }

  public async updateResource(id: string, body: Record<string, unknown>): Promise<supertest.Response> {
    return supertest.agent(this.app).put(`/records/${id}`).set('Content-Type', 'application/json').send(body);
  }

  public async deleteResource(id: string): Promise<supertest.Response> {
    return supertest.agent(this.app).delete(`/records/${id}`);
  }

  public async findRecord(body: Record<string, unknown>): Promise<supertest.Response> {
    return supertest.agent(this.app).post('/records/find').set('Content-Type', 'application/json').send(body);
  }

  public async getRecordVersions(body: Record<string, unknown>): Promise<supertest.Response> {
    return supertest.agent(this.app).post('/records/find/versions').set('Content-Type', 'application/json').send(body);
  }
}
