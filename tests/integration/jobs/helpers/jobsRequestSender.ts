import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export interface SearchTasksParams {
  resourceId?: string;
  version?: string;
  isCleaned?: boolean;
  status?: string;
  type?: string;
}

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getResources(prams: SearchTasksParams = {}): Promise<supertest.Response> {
  return supertest.agent(app).get('/records').query(prams).set('Content-Type', 'application/json');
}

export async function getResource(id: string): Promise<supertest.Response> {
  return supertest.agent(app).get(`/records/${id}`).set('Content-Type', 'application/json');
}

export async function updateResource(id: string, body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).put(`/records/${id}`).set('Content-Type', 'application/json').send(body);
}

export async function createResource(body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).post(`/records`).set('Content-Type', 'application/json').send(body);
}

export async function deleteResource(id: string): Promise<supertest.Response> {
  return supertest.agent(app).delete(`/records/${id}`).set('Content-Type', 'application/json');
}
