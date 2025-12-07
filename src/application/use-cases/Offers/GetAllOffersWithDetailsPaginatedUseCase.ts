import { OfferWithDetails } from '@/domian/entities/OfferWithDetails';
import { IOfferRepository, PaginationOptions, PaginatedResult } from '@/domian/repository/IOfferRepository';

export class GetAllOffersWithDetailsPaginatedUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(options?: PaginationOptions): Promise<PaginatedResult<OfferWithDetails>> {
        return await this.offerRepository.getAllWithDetailsPaginated(options);
    }
}
