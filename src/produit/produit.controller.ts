import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ProduitService } from './produit.service';
import { ProduitDtoCreate, ProduitDtoUpdate, ProduitLotDtoCreate } from './dtos/produitDto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
@Controller('produit')
@UseGuards(JwtAuthGuard) // protège toutes les routes du contrôleur
export class ProduitController {

    constructor(private produitService: ProduitService) { }


    @Get('liste')
    async findAll() {
        const result = await this.produitService.findAll();
        return {
            statusCode: HttpStatus.OK,
            message: 'Liste réussie',
            data: result,
        };
    }
    @Delete('supprimer/:id')
    async delete(@Param('id') id: number) {
        const result = await this.produitService.delete(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Suppression réussie',
            data: result,
        };
    }
    @Post('creer')
    async create(
        @Body() dto: ProduitDtoCreate,
        @Req() req: any) {

        const userId = req.user.sub;
        const result = await this.produitService.create(dto, userId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Création réussie',
            data: result,
        };
    }

    @Get('detailProduit/:code_barre')
    findByCodeBarre(@Param('code_barre') code_barre: string) {
        return this.produitService.findByCodeBarre(code_barre);
    }

    @Get('verifierCodeProduit/:code_produit')
    findByCodeProduit(@Param('code_produit') code_produit: string) {
        return this.produitService.verificationCodeProduit(code_produit);
    }

    @Put(':codeProd')
    async update(
        @Param('codeProd') codeProd: string,
        @Body() dto: ProduitDtoUpdate,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const result = await this.produitService.ajouterCodeBarre(codeProd, dto, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Produit mise à jour avec succes',
            data: result,
        };
    }
    @Get('nombreLotProduit/:code_barre')
    AfficherNombreDeLotParProduit(@Param('code_barre') code_barre: string) {
        return this.produitService.AfficherNombreDeLotParProduit(code_barre);
    }

    @Get('nombreLotProduitid/:idprod')
    AfficherNombreDeLotParProduitid(@Param('idprod') idprod: number) {
        return this.produitService.AfficherNombreDeLotParProduitId(idprod);
    }



    @Get('quantiteProduitid/:idprod')
    AfficherQuantiteParProduitid(@Param('idprod') idprod: number) {
        return this.produitService.AfficherQuantiteParProduitid(idprod);
    }
    @Get('quantiteProduit/:code_barre')
    AfficherQuantiteParProduit(@Param('code_barre') code_barre: string) {
        return this.produitService.AfficherQuantiteParProduit(code_barre);
    }



    @Post('miseAjourProduit/:codeProd/:codeBarre')
    async miseAjourProduit(
        @Param('codeProd') codeProd: string,
        @Param('codeBarre') codeBarre: string,
        @Body() data: ProduitDtoUpdate,
        @Body() data1: ProduitLotDtoCreate,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const result = await this.produitService.enregistrerProduitStock(codeProd, codeBarre, data, data1, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Produit mise à jour avec succes',
            data: result,
        };
    }


    @Get('informationProduit/:idProduit')
    afficheListeLotParProduit(@Param('idProduit') idProduit: string) {
        return this.produitService.afficheListeLotParProduit(idProduit);
    }


    @Get("sommeQuantite/:idProduit")
    async getSommeQuantiteParProduit(@Param("idProduit") idProduit: string) {
        return this.produitService.sommeQuantiteParProduit(idProduit);
    }

    @Get("sommePrixAchat/:idProduit")
    async getSommePrixAchatParProduit(@Param("idProduit") idProduit: string) {
        return this.produitService.sommePrixAchatParProduit(idProduit);
    }


    // modifier un type d'équipement
    @Put('modifier/lotProduit/:id')

    async updateLotProduit(@Param('id') id: number,

        @Body() dto: ProduitLotDtoCreate, @Req() req: any) {
        const userId = req.user.sub;
        const result = await this.produitService.updateLotProduit(id, dto, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Modification réussie',
            data: result,
        };
    }




    @Post('ajouterProduitTemporel/:codeBarre')
    async ajouterProduitTemporel(
        @Param('codeBarre') codeBarre: string,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const result = await this.produitService.enregistrerProduitSortantProvisoire(codeBarre, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Produit mise à jour avec succes',
            data: result,
        };
    }


    @Get('listeProduitEnSortie')
    afficheListeProduitPourSortie(@Req() req: any) {
        const userId = req.user.sub;
        return this.produitService.afficheListeProduitPourSortie(userId);
    }

    @Get('listeProduitInventaire')
    afficheListeLotParProduitInventaire(@Req() req: any) {
        const userId = req.user.sub;
        return this.produitService.afficheListeLotParProduitInventaire();
    }




    @Get('listeProduitInventaireValide')
    afficheListeLotParProduitValide(@Req() req: any) {
        const userId = req.user.sub;
        return this.produitService.afficheListeLotParProduitValide();
    }




    // @Put(':id/quantite-theorique')

    // async updateQuantiteTheorique(@Param('id') id: number,

    //     @Param('quantiteTheorique') quantiteTheorique: number,
    //     @Req() req: any) {
    //     const userId = req.user.sub;
    //     const result = await this.produitService.mettreAJourQuantiteTheorique(Number(id), quantiteTheorique, userId);
    //     return {
    //         statusCode: HttpStatus.OK,
    //         message: 'Modification réussie',
    //         data: result,
    //     };
    // }


    @Get("miseAjourQuantite/:idlot/:quantiteLot")
    async getmettreAJourQuantite(
        @Param("idlot") idlot: number,
        @Param('quantiteLot') quantiteLot: number,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const result = await this.produitService.mettreAJourQuantiteTheorique(idlot, quantiteLot, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Modification réussie',
            data: result,
        };
    }




    @Get("ramenerQuantite/:idlot")
    async getRamenerQuantite(
        @Param("idlot") idlot: number,

        @Req() req: any
    ) {
        const userId = req.user.sub;
        const result = await this.produitService.RamenerQuantiteTheorique(idlot, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Modification réussie',
            data: result,
        };
    }



    @Post('creerLotProduit')
    async createLotProduit(
        @Body() dto: ProduitLotDtoCreate,
        @Req() req: any) {

        const userId = req.user.sub;
        const result = await this.produitService.enregistrerProduitStockSansCodeBarre(dto, userId);
        return {
            statusCode: HttpStatus.CREATED,
            message: 'Création réussie',
            data: result,
        };
    }





    @Delete('supprimerLotProduit/:id')
    async LotProduit(@Param('id') id: number) {
        const result = await this.produitService.deleteLotProduit(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Suppression réussie',
            data: result,
        };
    }



    @Post('ajouterProduitTemporelParCode/:codeProduit')
    async ajouterProduitTemporelParCodeProduit(
        @Param('codeProduit') codeProduit: string,
        @Req() req: any
    ) {
        const userId = req.user.sub;
        const result = await this.produitService.enregistrerProduitSortantProvisoireParCodeProduit(codeProduit, userId);
        return {
            statusCode: HttpStatus.OK,
            message: 'Produit mise à jour avec succes',
            data: result,
        };
    }


    @Get('detailProduitParCode/:code')
    findByCode(@Param('code') code: string) {
        return this.produitService.findByProduitParCode(code);
    }



    @Delete('supprimerProduitTemporel/:id')
    async ProduitTemporel(@Param('id') id: number) {
        const result = await this.produitService.deleteProduitTemporel(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Suppression réussie',
            data: result,
        };
    }


    @Delete('multiple')
    async deleteMultiple(@Body() body: { ids: number[] }) {
        return this.produitService.deleteProduitsCochetTemporels(body.ids);
    }
}


