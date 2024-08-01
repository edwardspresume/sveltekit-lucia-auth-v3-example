import { db } from '$lib/database/prisma';
import { json, type RequestHandler } from '@sveltejs/kit';

// USAGE: from client:
// const form = event.target as HTMLFormElement
// const data = new FormData(form)
// fetch with post request to endpoint with body set to data
export const POST: RequestHandler = async (event) => {
	const data = await event.request.formData();
	const id = data.get('id');
	return json({ id });
};

export const GET = async () => {
	const projects = await db.project.findMany();
	return json(projects);
};
