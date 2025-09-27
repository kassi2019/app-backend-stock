// user.controller.ts
import { Controller, Get, UseGuards, Req, UploadedFile, BadRequestException, UseInterceptors, Post, Put, Body, Request, HttpStatus, Param, ParseIntPipe, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { UsersService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { extname } from 'path';
import { UtilisateurDtoUpdate } from './dtos/utilisateurDto';
@Controller('users')
@UseGuards(JwtAuthGuard) // protège toutes les routes du contrôleur
export class UserController {
    constructor(private readonly usersService: UsersService) { }
    // @UseGuards(JwtAuthGuard)
    // @Get('me')
    // getMe(@Req() req) {
    //     return req.user;
    // }


    /**
   * 1️⃣ Changer photo de profil
   */
    @Post('profile-photo')
    @UseInterceptors(
        FileInterceptor('photo', {
            storage: diskStorage({
                destination: path.join(__dirname, '..', '..', 'uploads', 'profile-photos'),
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
            limits: { fileSize: 2 * 1024 * 1024 }, // 2 Mo max
        }),
    )
    async uploadProfilePhoto(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) throw new BadRequestException('Aucune image uploadée');
        return this.usersService.updateProfilePhoto(req.user.sub, file.filename);
    }

    /**
  * 2️⃣ Modifier infos utilisateur
  */
    @Put('profile')
    async updateProfile(@Body() body: any, @Req() req: any) {
        return this.usersService.updateProfile(req.user.sub, body);
    }

    /**
     * 3️⃣ Changer mot de passe
     */
    @Put('password')
    async changePassword(@Body() body: any, @Req() req) {
        const { oldPassword, newPassword, confirmPassword } = body;
        if (newPassword !== confirmPassword) {
            throw new BadRequestException('Les mots de passe ne correspondent pas');
        }
        return this.usersService.changePassword(req.user.sub, oldPassword, newPassword);
    }

    /**
     * 4️⃣ Liste des utilisateurs connectés
     */
    @Get('info-user')
    async getConnectedUsers(@Req() req: any) {
        return this.usersService.getConnectedUsers(req.user.sub);
    }



    @Get('liste')
    async findAll() {
        const result = await this.usersService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Liste réussie',
            data: result,
        };
    }


    @Get('afficherUtilisateurParRole/:id')
    async afficherUtilisateurParRole(@Param('id', ParseIntPipe) id: number) {
        const result = await this.usersService.afficherleSupperviseurParRole(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'liste réussie',
            data: result,
        };
    }


    @Delete('supprimer/:id')
    async delete(@Param('id') id: number) {
        const result = await this.usersService.delete(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Suppression réussie',
            data: result,
        };
    }

    @Put('modifier/:id')
    async update(@Param('id') id: number,
        @Body() dto: UtilisateurDtoUpdate) {
        const result = await this.usersService.update(id, dto);
        return {
            statusCode: HttpStatus.OK,
            message: 'Modification réussie',
            data: result,
        };
    }
}
