import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log('🌱 Memulai proses seeding database...');

	// 1. Buat User Admin & Reguler
	const hashedPassword = await bcrypt.hash('password123', 10);

	const admin = await prisma.users.upsert({
		where: { email: 'admin@khwarizmi.ac.id' },
		update: {},
		create: {
			name: 'Administrator',
			email: 'admin@khwarizmi.ac.id',
			password: hashedPassword,
			role: 'admin',
			phone: '081234567890'
		}
	});

	const staff = await prisma.users.upsert({
		where: { email: 'staff@khwarizmi.ac.id' },
		update: {},
		create: {
			name: 'Staff Gudang',
			email: 'staff@khwarizmi.ac.id',
			password: hashedPassword,
			role: 'user',
			phone: '089876543210'
		}
	});

	console.log('✅ Berhasil membuat akun Admin dan Staff');

	// 2. Buat Kategori
	const catElektronik = await prisma.categories.create({
		data: { name: 'Elektronik', icon: '💻' }
	});

	const catAtk = await prisma.categories.create({
		data: { name: 'Alat Tulis Kantor', icon: '📝' }
	});

	console.log('✅ Berhasil membuat Kategori (Elektronik, ATK)');

	// 3. Buat Barang (Items)
	await prisma.items.createMany({
		data: [
			{
				code: 'BRG-001',
				name: 'Laptop Asus ROG',
				category_id: catElektronik.id,
				stock: 10,
				unit: 'Unit',
				description: 'Laptop gaming untuk kebutuhan rendering'
			},
			{
				code: 'BRG-002',
				name: 'Kabel UTP Cat 6',
				category_id: catElektronik.id,
				stock: 100,
				unit: 'Meter',
				description: 'Kabel jaringan LAN'
			},
			{
				code: 'ATK-001',
				name: 'Kertas HVS A4 80gr',
				category_id: catAtk.id,
				stock: 50,
				unit: 'Rim',
				description: 'Kertas HVS putih standar'
			}
		]
	});

	console.log('✅ Berhasil memasukkan daftar Barang (Items)');
	console.log('🎉 Seeding Selesai!');
}

main()
	.catch((e) => {
		console.error('❌ Gagal melakukan seeding:', e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
