import { db } from '$lib/database/prisma.js';
import { error } from '@sveltejs/kit';

export const load = async ({ params }) => {
	const project = await db.project.findUnique({
		where: { slug: params.slug }
	});
	if (!project) {
		throw error(404, 'project not found');
	}

	return { project };
};
