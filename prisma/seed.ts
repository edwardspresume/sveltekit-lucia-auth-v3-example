import { PrismaClient, User, Tag, Project } from '@prisma/client';
import { faker } from '@faker-js/faker';

const db = new PrismaClient();

const NUM_USERS = 10;
const NUM_PROJECTS = 30;
const NUM_TAGS = 20;

export const slugify = (text: string) =>
	text
		.replace(/\s/g, '-')
		.replace(/[^a-zA-Z0-9-]/g, '')
		.toLowerCase();

const createUsers = async (numUsers: number): Promise<User[]> => {
	const users: User[] = [];
	for (let i = 0; i < numUsers; i++) {
		const user = await db.user.create({
			data: {
				name: faker.person.firstName(),
				email: faker.internet.email(),
				profile: {
					create: {
						bio: faker.lorem.sentences(2)
					}
				}
			}
		});
		users.push(user);
	}
	return users;
};

const createTags = async (numTags: number): Promise<Tag[]> => {
	const tags: Tag[] = [];
	for (let i = 0; i < numTags; i++) {
		const tag = await db.tag.create({
			data: {
				name: faker.word.noun()
			}
		});
		tags.push(tag);
	}
	return tags;
};

const createProjects = async (numProjects: number, users: User[], tags: Tag[]): Promise<void> => {
	for (let i = 0; i < numProjects; i++) {
		const authorId = users[Math.floor(Math.random() * users.length)].id;
		const numTagsForProject = Math.floor(Math.random() * 5) + 1;
		const projectTags: Tag[] = [];
		for (let j = 0; j < numTagsForProject; j++) {
			const tag = tags[Math.floor(Math.random() * tags.length)];
			projectTags.push({ id: tag.id, name: tag.name });
		}

		await db.project.create({
			data: {
				name: faker.commerce.productName(),
				description: faker.lorem.paragraph(),
				status: faker.helpers.arrayElement(['open', 'in progress', 'completed']),
				authorId,
				slug: slugify(faker.commerce.productName()),
				published: faker.datatype.boolean(),
				tags: {
					connect: projectTags
				}
			}
		});
	}
};

const main = async () => {
	const users = await createUsers(NUM_USERS);
	const tags = await createTags(NUM_TAGS);
	await createProjects(NUM_PROJECTS, users, tags);
};

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await db.$disconnect();
	});
