import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

type Project = {
	name: string;
	description?: string;
};

// fetch('https://dummyjson.com/todos?limit=3&skip=10')
// .then(res => res.json())
// .then(console.log);

// TODO: alternatively use FakerJS
export const getProjects = async () => {
	const response = await fetch('https://dummyjson.com/posts');
	const { posts } = await response.json();
	return posts.map((post) => ({ name: post.title, description: post.content })) as Project[];
};

export const slugify = (text: string) =>
	text
		.replace(/\s/g, '-')
		.replace(/[^a-zA-Z0-9-]/g, '')
		.toLowerCase();

const main = async () => {
	const posts = await getProjects();
	for (const post of posts) {
		const { name, description } = post;
		await db.project.create({
			data: {
				name,
				description,
				slug: slugify(name)
			}
		});
	}
};

main();
