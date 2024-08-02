import { PrismaClient } from '@prisma/client';
import { db } from './db';

export class Projects {
	db: PrismaClient = db;

	async bySlug(slug: string) {
		return await this.db.project.findUnique({
			where: { slug }
		});
	}
}

export const projects = new Projects();
