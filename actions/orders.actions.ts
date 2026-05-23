'use server';

import { createOrder } from '@/lib/api';
import { createClient } from '@/lib/supabase/server';
import type { CheckoutFormValues, CheckoutLineItemInput } from '@/lib/types';
import { checkoutPayloadSchema } from '@/lib/validations/checkout';

export type CheckoutOrderPayload = {
	form: CheckoutFormValues;
	items: CheckoutLineItemInput[];
	subtotal: number;
	total: number;
};

export async function submitCheckoutOrder(payload: CheckoutOrderPayload) {
	const parsed = checkoutPayloadSchema.safeParse(payload);
	if (!parsed.success) {
		return { ok: false, error: 'Мэдээлэл буруу байна. Формоо шалгана уу.' };
	}

	const { form, items, subtotal, total } = parsed.data;

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	let accessToken: string | undefined;
	if (user) {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		accessToken = session?.access_token;
	}

	try {
		const { data } = await createOrder({ form, items, subtotal, total }, accessToken);
		return { ok: true, orderId: data.orderId };
	} catch (err) {
		console.error('orders insert', err);
		return {
			ok: false,
			error: err instanceof Error ? err.message : 'Захиалга хадгалагдаагүй байна.',
		};
	}
}
