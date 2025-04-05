import { supabase } from './supabase';

interface AccountCredentials {
    email: string;
    password: string;
    role: string;
    id:number;

}

export async function createAccount(credentials: AccountCredentials) {
    const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            role: credentials.role,
          },
        },
    })

    if (error) throw error;

    if (data.user && credentials.role === 'student') {
        const { error: updateError } = await supabase
            .from('students')
            .update({ auth_uid: data.user.id })
            .eq('id', credentials.id);
        
        if (updateError) throw updateError;
    }

    return data;
}