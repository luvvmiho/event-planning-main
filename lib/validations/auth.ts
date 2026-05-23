import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Зөв и-мэйл хаяг оруулна уу'),
  password: z.string().min(6, 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Нэр хамгийн багадаа 2 тэмдэгт байх ёстой'),
    email: z.string().email('Зөв и-мэйл хаяг оруулна уу'),
    phone: z.string().min(8, 'Утасны дугаар оруулна уу'),
    password: z.string().min(6, 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'),
    confirmPassword: z.string(),
    userType: z.enum(['user', 'provider']).default('user'),
    serviceCategory: z.string().optional(),
    registrationNumber: z.string().optional(),
    acceptTerms: z
      .boolean()
      .refine((v) => v === true, { message: 'Үйлчилгээний нөхцөлийг зөвшөөрнө үү' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Нууц үг таарахгүй байна',
    path: ['confirmPassword'],
  })
