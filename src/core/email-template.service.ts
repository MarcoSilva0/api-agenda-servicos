import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class EmailTemplateService {
  private readonly templatesPath = join(process.cwd(), 'src', 'templates', 'email');

  /**
   * Renderiza um template de email substituindo as variáveis
   */
  renderTemplate(templateName: string, variables: Record<string, string>): string {
    try {
      const templatePath = join(this.templatesPath, `${templateName}.html`);
      let template = readFileSync(templatePath, 'utf8');

      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        template = template.replace(regex, value || '');
      });

      return template;
    } catch (error) {
      console.error(`Erro ao carregar template ${templateName}:`, error);
      return this.getFallbackTemplate(variables);
    }
  }

  private getFallbackTemplate(variables: Record<string, string>): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
            .header { color: #333; text-align: center; margin-bottom: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bem-vindo, ${variables.userName || 'Usuário'}!</h1>
              <p>Sua conta na ${variables.companyName || 'nossa plataforma'} foi criada com sucesso!</p>
              <p>Obrigado por se juntar a nós! 🎉</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  getAvailableTemplates(): string[] {
    return [
      'welcome',
      'password-reset',
      'appointment-confirmation',
      'appointment-reminder',
    ];
  }
}