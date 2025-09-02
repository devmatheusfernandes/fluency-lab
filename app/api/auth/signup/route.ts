import { NextResponse } from 'next/server';
import { AuthService } from '@/services/authService';
import { validateAndSanitizeEmail, sanitizeInput, validatePassword } from '@/lib/utils';
import { authRateLimiter } from '@/lib/rateLimit';
import { NextRequest } from 'next/server';

const authService = new AuthService();

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResult = authRateLimiter(request);
  if (rateLimitResult.limited) {
    return NextResponse.json(
      { error: 'Too many authentication attempts, please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { name, email, password } = await request.json();
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes.' }, { status: 400 });
    }
    
    // Validate and sanitize email
    const sanitizedEmail = validateAndSanitizeEmail(email);
    if (!sanitizedEmail) {
      return NextResponse.json({ error: 'Formato de email inválido.' }, { status: 400 });
    }
    
    // Sanitize name
    const sanitizedName = sanitizeInput(name.trim());
    if (sanitizedName.length < 2) {
      return NextResponse.json({ error: 'Nome deve ter pelo menos 2 caracteres.' }, { status: 400 });
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json({ error: passwordValidation.message }, { status: 400 });
    }

    const newUser = await authService.registerUser({ 
      name: sanitizedName, 
      email: sanitizedEmail, 
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
}