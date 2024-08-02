import { PrismaClient } from '@prisma/client';
import { prisma } from './db';

export class Projects {
	db: PrismaClient = prisma;

	async bySlug(slug: string) {
		return await this.db.project.findUnique({
			where: { slug }
		});
	}
}

export const projects = new Projects();
