import { Injectable, BadRequestException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class FileUploadService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');
  private readonly allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor() {
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory() {
    try {
      await fs.access(this.uploadsDir);
    } catch {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    }
  }

  private async ensureCompanyDirectory(companyId: string) {
    const companyDir = path.join(this.uploadsDir, 'companies', companyId);
    try {
      await fs.access(companyDir);
    } catch {
      await fs.mkdir(companyDir, { recursive: true });
    }
    return companyDir;
  }

  /**
   * Salva a logo da empresa a partir de base64
   */
  async saveCompanyLogo(companyId: string, base64Data: string, originalName?: string): Promise<string> {
    try {
      // Extrair informações do base64
      const matches = base64Data.match(/^data:(.+);base64,(.+)$/);
      if (!matches) {
        throw new BadRequestException('Formato de arquivo inválido. Use base64 com data URL.');
      }

      const mimeType = matches[1];
      const fileData = matches[2];
      
      // Determinar extensão do arquivo
      let extension = '';
      switch (mimeType) {
        case 'image/jpeg':
          extension = '.jpg';
          break;
        case 'image/png':
          extension = '.png';
          break;
        case 'image/gif':
          extension = '.gif';
          break;
        case 'image/webp':
          extension = '.webp';
          break;
        default:
          throw new BadRequestException('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.');
      }

      // Verificar tamanho do arquivo
      const buffer = Buffer.from(fileData, 'base64');
      if (buffer.length > this.maxFileSize) {
        throw new BadRequestException(`Arquivo muito grande. Máximo permitido: ${this.maxFileSize / 1024 / 1024}MB`);
      }

      // Criar diretório da empresa
      const companyDir = await this.ensureCompanyDirectory(companyId);
      
      // Definir nome do arquivo
      const fileName = `logo-empresa${extension}`;
      const filePath = path.join(companyDir, fileName);

      // Remover logo anterior se existir
      await this.removeOldLogo(companyDir, fileName);

      // Salvar novo arquivo
      await fs.writeFile(filePath, buffer);

      // Retornar URL relativa
      return `/uploads/companies/${companyId}/${fileName}`;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Erro ao salvar arquivo: ${error.message}`);
    }
  }

  /**
   * Salva a logo da empresa a partir de buffer
   */
  async saveCompanyLogoFromBuffer(companyId: string, buffer: Buffer, mimeType: string): Promise<string> {
    try {
      // Verificar tipo de arquivo
      let extension = '';
      switch (mimeType) {
        case 'image/jpeg':
          extension = '.jpg';
          break;
        case 'image/png':
          extension = '.png';
          break;
        case 'image/gif':
          extension = '.gif';
          break;
        case 'image/webp':
          extension = '.webp';
          break;
        default:
          throw new BadRequestException('Tipo de arquivo não suportado. Use JPG, PNG, GIF ou WebP.');
      }

      // Verificar tamanho
      if (buffer.length > this.maxFileSize) {
        throw new BadRequestException(`Arquivo muito grande. Máximo permitido: ${this.maxFileSize / 1024 / 1024}MB`);
      }

      // Criar diretório da empresa
      const companyDir = await this.ensureCompanyDirectory(companyId);
      
      // Definir nome do arquivo
      const fileName = `logo-empresa${extension}`;
      const filePath = path.join(companyDir, fileName);

      // Remover logo anterior se existir
      await this.removeOldLogo(companyDir, fileName);

      // Salvar arquivo
      await fs.writeFile(filePath, buffer);

      // Retornar URL relativa
      return `/uploads/companies/${companyId}/${fileName}`;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Erro ao salvar arquivo: ${error.message}`);
    }
  }

  /**
   * Remove logos antigas da empresa
   */
  private async removeOldLogo(companyDir: string, currentFileName: string) {
    try {
      const files = await fs.readdir(companyDir);
      const logoFiles = files.filter(file => 
        file.startsWith('logo-empresa') && 
        file !== currentFileName
      );

      for (const file of logoFiles) {
        const filePath = path.join(companyDir, file);
        await fs.unlink(filePath);
      }
    } catch (error) {
      // Ignorar erros ao remover arquivos antigos
      console.warn('Erro ao remover logo antiga:', error.message);
    }
  }

  /**
   * Remove a logo da empresa
   */
  async removeCompanyLogo(companyId: string): Promise<void> {
    try {
      const companyDir = path.join(this.uploadsDir, 'companies', companyId);
      const files = await fs.readdir(companyDir);
      const logoFiles = files.filter(file => file.startsWith('logo-empresa'));

      for (const file of logoFiles) {
        const filePath = path.join(companyDir, file);
        await fs.unlink(filePath);
      }
    } catch (error) {
      // Ignorar se o diretório não existir
      console.warn('Erro ao remover logo:', error.message);
    }
  }

  /**
   * Verifica se um arquivo existe
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const fullPath = path.join(this.uploadsDir, filePath.replace('/uploads/', ''));
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtém o caminho físico do arquivo
   */
  getPhysicalPath(relativePath: string): string {
    return path.join(this.uploadsDir, relativePath.replace('/uploads/', ''));
  }
}