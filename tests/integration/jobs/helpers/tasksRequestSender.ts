import * as supertest from 'supertest';
import { Application } from 'express';

import { container } from 'tsyringe';
import { ServerBuilder } from '../../../../src/serverBuilder';

let app: Application | null = null;

export function init(): void {
  const builder = container.resolve<ServerBuilder>(ServerBuilder);
  app = builder.build();
}

export async function getAllResources(recordId: string): Promise<supertest.Response> {
  return supertest.agent(app).get(`/records/${recordId}/tasks`).set('Content-Type', 'application/json');
}

export async function getResource(recordId: string, taskId: string): Promise<supertest.Response> {
  return supertest.agent(app).get(`/records/${recordId}/tasks/${taskId}`).set('Content-Type', 'application/json');
}

export async function updateResource(recordId: string, taskId: string, body: Record<string, unknown>): Promise<supertest.Response> {
  return supertest.agent(app).put(`/records/${recordId}/tasks/${taskId}`).set('Content-Type', 'application/json').send(body);
}

export async function createResource(recordId: string, body: Record<string, unknown> | Record<string, unknown>[]): Promise<supertest.Response> {
  return supertest.agent(app).post(`/records/${recordId}/tasks`).set('Content-Type', 'application/json').send(body);
}

export async function deleteResource(recordId: string, taskId: string): Promise<supertest.Response> {
  return supertest.agent(app).delete(`/records/${recordId}/tasks/${taskId}`).set('Content-Type', 'application/json');
}
