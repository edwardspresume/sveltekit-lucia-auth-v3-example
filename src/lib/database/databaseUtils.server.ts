import { eq } from 'drizzle-orm';
import { database } from './database.server';
import { usersTable, type UserInsertSchema } from './schema';

export const checkIfUserExists = async (email: string) => {
	const [existingUser] = await database
		.select({
			id: usersTable.id,
			password: usersTable.password,
			isEmailVerified: usersTable.isEmailVerified
		})
		.from(usersTable)
		.where(eq(usersTable.email, email));

	return existingUser;
};

export const insertNewUser = async (user: UserInsertSchema) => {
	return await database.insert(usersTable).values(user);
};

export const getAllUsers = async () => {
	const queryResult = await database
		.select({
			id: usersTable.id,
			name: usersTable.name,
			email: usersTable.email
		})
		.from(usersTable);

	return queryResult;
};

export const deleteAllUsers = async () => {
	return await database.delete(usersTable);
};
