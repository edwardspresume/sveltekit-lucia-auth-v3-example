import { eq } from 'drizzle-orm';
import { database } from './database.server';
import { usersTable, type UserInsertSchema } from './schema';

export const checkIfEmailExists = async (email: string) => {
	const queryResult = await database
		.select({
			email: usersTable.email
		})
		.from(usersTable)
		.where(eq(usersTable.email, email));

	return queryResult.length > 0;
};

export const insertNewUser = async (user: UserInsertSchema) => {
	return await database.insert(usersTable).values(user);
};

export const getAllUsers = async () => {
	const queryResult = await database
		.select({
			name: usersTable.name,
			email: usersTable.email
		})
		.from(usersTable);

	return queryResult;
};

export const deleteAllUsers = async () => {
	return await database.delete(usersTable);
};

export const getUserName = async (userId: string) => {
	const queryResult = await database
		.select({
			name: usersTable.name
		})
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	return queryResult[0]?.name;
};
