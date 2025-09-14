import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { authRateLimiter } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';
import { withValidation } from '@/lib/validation';
import { z } from 'zod';

const authService = new AuthService();

// Schema de validação para registro de usuário
const signupSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  email: z.string()
    .email('Formato de email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha deve ter no máximo 128 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
});

export const POST = withValidation(
  async (request: NextRequest, validatedData: { body: z.infer<typeof signupSchema> }) => {
    // Apply rate limiting
    const rateLimitResult = authRateLimiter(request);
    if (rateLimitResult.limited) {
      return NextResponse.json(
        { error: 'Too many authentication attempts, please try again later.' },
        { status: 429 }
      );
    }

    try {
      const { name, email, password } = validatedData.body;

      const newUser = await authService.registerUser({ 
        name: name.trim(), 
        email: email.toLowerCase().trim(), 
        password 
      });
      return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        return NextResponse.json({ error: 'Este email já está em uso.' }, { status: 409 });
      }
      console.error("Signup API Error:", error);
      return NextResponse.json({ error: 'Erro ao criar conta.' }, { status: 500 });
    }
  },
  {
    bodySchema: signupSchema,
    logAttacks: true,
    blockAttacks: true
  }
);