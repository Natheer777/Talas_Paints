import { OfferWithDetails } from '@/domian/entities/OfferWithDetails';
import { IOfferRepository, PaginationOptions, PaginatedResult } from '@/domian/repository/IOfferRepository';

export class GetAllOffersWithDetailsPaginatedUseCase {
    constructor(private offerRepository: IOfferRepository) { }

    async execute(options?: PaginationOptions): Promise<PaginatedResult<OfferWithDetails>> {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.min(1000, Math.max(1, options?.limit || 10)); // Default 10, max 1000

        return await this.offerRepository.getAllWithDetailsPaginated({ page, limit });
    }
}
