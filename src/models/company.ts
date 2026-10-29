import { Store } from './store';
import { Brand } from './brand';
import { Country } from './country';

export class Company{
    company_id?: number;
    parent_company_id?: number;
    company_name?: string;
    company_common_name_en?: string;
    company_common_name_ar?: string;
    company_description_en?: string;
    company_description_ar?: string;
    company_website?: string;
    company_email?: string;
    company_logo?: string | null;
    company_logo_url?: string | null;
    company_status?: number;
    total_candidates?: number;
    country_id?: number;
    currency_code?: string;
    country?: Country;
    subcompanies?: Company[];
    subCompanies?: Company[];
    parentCompany?: Company;
    stores?: Store[];
    brands?: Brand[];
}
