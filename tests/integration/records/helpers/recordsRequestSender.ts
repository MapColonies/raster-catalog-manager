import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function recordExists(id: string): Promise<supertest.Response> {
  return supertest.agent(app).get(`/records/exists/${id}`);
}

export async function createResource(body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).post(`/records`).set('Content-Type', 'application/json').send(body);
}

export async function updateResource(id: string, body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).put(`/records/${id}`).set('Content-Type', 'application/json').send(body);
}

export async function deleteResource(id: string): Promise<supertest.Response> {
  return supertest.agent(app).delete(`/records/${id}`);
}

export async function findRecord(body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).post('/records/find').set('Content-Type', 'application/json').send(body);
}
