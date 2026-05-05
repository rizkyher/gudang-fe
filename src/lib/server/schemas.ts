import { z } from 'zod';

export const LoginSchema = z.object({
	email: z.string().email('Format email tidak valid'),
	password: z.string().min(1, 'Password tidak boleh kosong')
});

export const CategorySchema = z.object({
	name: z.string().min(1, 'Nama kategori tidak boleh kosong'),
	icon: z.string().optional().nullable()
});

export const ItemSchema = z.object({
	code: z.string().min(1, 'Kode barang tidak boleh kosong'),
	name: z.string().min(1, 'Nama barang tidak boleh kosong'),
	category_id: z.coerce.number().int().min(1, 'Kategori tidak valid'),
	stock: z.coerce.number().int().min(0, 'Stok minimal 0'),
	unit: z.string().min(1, 'Satuan tidak boleh kosong'),
	icon: z.string().optional().nullable(),
	description: z.string().optional().nullable()
});

export const ItemUpdateSchema = ItemSchema.partial();

export const RequestItemSchema = z.object({
	id: z.coerce.number().int().min(1, 'Item ID tidak valid'),
	quantity: z.coerce.number().int().min(1, 'Kuantitas minimal 1')
});

export const InventoryRequestSchema = z.object({
	items: z.array(RequestItemSchema).min(1, 'Minimal satu barang diminta'),
	notes: z.string().optional().nullable()
});

export const RequestStatusSchema = z.object({
	status: z.enum(['pending', 'processed', 'ready', 'completed', 'rejected']),
	admin_note: z.string().optional().nullable()
});

export const DeliveryOrderSchema = z.object({
	inventory_request_id: z.coerce.number().int().min(1, 'Request ID tidak valid'),
	driver_name: z.string().min(1, 'Nama driver tidak boleh kosong'),
	license_plate: z.string().min(1, 'Plat nomor tidak boleh kosong'),
	notes: z.string().optional().nullable()
});

export const UserSchema = z.object({
	name: z.string().min(1, 'Nama tidak boleh kosong'),
	email: z.string().email('Format email tidak valid'),
	password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
	role: z.enum(['admin', 'user'])
});

export const UpdatePasswordSchema = z
	.object({
		current_password: z.string().min(1, 'Password saat ini wajib diisi'),
		new_password: z.string().min(6, 'Password baru minimal 6 karakter'),
		new_password_confirmation: z.string().min(6, 'Konfirmasi password minimal 6 karakter')
	})
	.refine((data) => data.new_password === data.new_password_confirmation, {
		message: 'Konfirmasi password tidak cocok',
		path: ['new_password_confirmation']
	});
