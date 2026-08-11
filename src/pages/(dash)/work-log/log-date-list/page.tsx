
import Pager from '@/components/common/pager';
// app/(dash)/log-date-list/page.tsx

import { CandidateWorkingDate } from '@/models/candidate-working-date';
import { page, track } from '@/providers/analytics.service';
import { listWorkingDates } from '@/providers/logged-in/candidate-working-hour.service';
import { useEffect, useState, Suspense } from 'react';
import { useTranslation } from 'react-i18next'; // Assuming you have a translation hook
import WorkLogDay from '@/components/app/work-log-day';
import { groupBy } from '@/utils/app';
import { zodResolver } from '@hookform/resolvers/zod';

// Import necessary components and services
import {
    Form
  } from "@/components/ui/form"
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { addDays, format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import Loading from './loading';
import DashLayout from '../../layout';
import { FormDateTimeInput } from '@/components/ui/form-datetime';


const LogDateListPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [candidateWorkingDates, setCandidateWorkingDates] = useState<any>([]);
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_count: 0,
  });


  const { handleSubmit, reset } = useForm();

  const [date, setDate] = useState<DateRange | undefined>({
      from: addDays(new Date(), -7),
      to: new Date(),
    })

  const formSchema = z.object({
      start_date: z.date({
        required_error: t('Please add date.')
      }).max(new Date(), {
        message: t("Can not add future dates."),
      }),
      end_date: z.date({
          required_error: t('Please add date.')
      }).max(new Date(), {
          message: t("Can not add future dates."),
      })
  // dateFormatted: z.string({
      // required_error: 'Please add date.'
      //})
  });/*.refine(data => timeComparisonValidator(data), {
      message: "Start time should be less than end time.",
  });*/
      
  const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      mode: "all",
      defaultValues: {
      // end_time: "00:00 AM"
      },
  })

  const handleManualSubmit = () => {
    // Manually trigger the form submission
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    page('Candidate Working Hours');
    loadData();

    return () => {
      track('page_exit', { page: 'Candidate Working Hours' });
    }
  }, []);

  const getUrlParams = () => {
         
    const { start_date, end_date } = form.getValues();

    let url = '';

    if (start_date) {
        url += "&start_date=" + format(start_date, "yyyy-M-d");
    }

    if (end_date) {
        url += "&end_date=" + format(end_date, "yyyy-M-d");
    }

    return url;
  }

  const loadData = async (page = 1) => {
    setLoading(true);
    const response = await listWorkingDates(page, getUrlParams());
    setLoading(false);

    setPagination({
      current_page: parseInt(response.headers.get('x-pagination-current-page')),
      total_pages: parseInt(response.headers.get('x-pagination-page-count')),
      total_count: parseInt(response.headers.get('X-Pagination-Total-Count')),
    });

    setCandidateWorkingDates(groupBy(response.data, 'date'));
  };

  const handleRefresh = async () => {
    await loadData();
  };

  type FieldValues = z.infer<typeof formSchema>;

  const onSubmit: any  = async (values: FieldValues) => {
      await loadPage(1);
  }

  const loadPage = (page: number) => {

    if ((page > 1 && page > pagination.total_pages) || page < 1) {
      return;
    }

    setPagination({
      ...pagination,
      current_page: page
    });

    loadData(page);
  }

  const secondsToTime = (secs: number) => {
    const h = Math.floor(secs / (60 * 60));
    const divisor_for_minutes = secs % (60 * 60);
    const m = Math.floor(divisor_for_minutes / 60);
    const divisor_for_seconds = divisor_for_minutes % 60;
    const s = Math.ceil(divisor_for_seconds);
    return `${h ? `${h}:` : ""}${m ? `${m}:${s}` : `${s}s`}`;
  };

  return (
    <Suspense fallback={<Loading />}> 
    <DashLayout>  
      <div className=' bg-white'>
          <div className="max-w-4xl mx-auto px-6 shadow-[0px_10px_20px_0px_rgba(0,0,0,0.05) xs:pt-0 sm:pt-6 pb-6">

              <h5 className='text-[color:var(--Neutral-95,#23233D)] text-2xl font-bold leading-8 capitalize'>
                {t("Time Log")}
              </h5>

          </div>    
      </div>
      
      <div className="max-w-4xl mx-auto p-6">
    
          <Popover>
            <PopoverTrigger asChild>
            <div className={ `cursor-pointer mb-6 w-full h-10 px-3 py-4 ${ (form.formState.isValid) ? 'bg-white border-[#4c6ff2]': ' bg-[#f9f9f9]'} rounded-lg 
                border border-[#c5c5cc] justify-center items-center gap-3 inline-flex` }>
                <div className="w-6 h-6 relative">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.8937 5.90926L13.7883 5.55017H13.414H3.66079C3.57263 5.55017 3.5 5.48547 3.5 5.38127C3.5 5.27708 3.57263 5.21238 3.66079 5.21238H12.7459H13.4138H13.414V4.71243L13.8936 4.85328C14.1246 4.0665 14.8352 3.5 15.6871 3.5C16.5093 3.5 17.2221 4.06317 17.4542 4.85328L17.5596 5.21238H17.9339H20.3392C20.4274 5.21238 20.5 5.27708 20.5 5.38127C20.5 5.48547 20.4274 5.55017 20.3392 5.55017H17.9339H17.5499L17.4508 5.92114C17.2449 6.69211 16.518 7.26255 15.6871 7.26255C14.8353 7.26255 14.1249 6.6961 13.8937 5.90926ZM15.6607 6.92475C16.4895 6.92475 17.1916 6.24861 17.1916 5.38127C17.1916 4.50573 16.4546 3.83779 15.6607 3.83779C14.832 3.83779 14.1299 4.51394 14.1299 5.38127C14.1299 6.24864 14.832 6.92475 15.6607 6.92475Z" fill="#7D7D8D" stroke="#7D7D8D"/>
                    <path d="M5.48461 11.0634H3.66079C3.29076 11.0634 3 11.3578 3 11.7323C3 12.1069 3.29076 12.4012 3.66079 12.4012H5.48461C5.77536 13.3912 6.67398 14.1136 7.75772 14.1136C8.81488 14.1136 9.74008 13.3912 10.0045 12.4012H20.3392C20.7092 12.4012 21 12.1069 21 11.7323C21 11.3578 20.7092 11.0634 20.3392 11.0634H10.0045C9.71373 10.0735 8.81512 9.35107 7.75772 9.35107C6.67417 9.35107 5.77535 10.0735 5.48461 11.0634ZM8.76216 11.7323C8.76216 12.321 8.28649 12.7758 7.73133 12.7758C7.17618 12.7758 6.7005 12.321 6.7005 11.7323C6.7005 11.1437 7.17618 10.6889 7.73133 10.6889C8.28649 10.6889 8.76216 11.1437 8.76216 11.7323Z" fill="#7D7D8D"/>
                    <path d="M10.2422 17.9497H3.66079C3.29076 17.9497 3 18.244 3 18.6186C3 18.9931 3.29076 19.2875 3.66079 19.2875H10.2422C10.533 20.2774 11.4316 20.9998 12.5153 20.9998C13.5725 20.9998 14.4977 20.2774 14.7621 19.2875H20.3392C20.7092 19.2875 21 18.9931 21 18.6186C21 18.244 20.7092 17.9497 20.3392 17.9497H14.7621C14.4714 16.9598 13.5727 16.2373 12.5153 16.2373C11.4316 16.2373 10.533 16.9596 10.2422 17.9497ZM13.5198 18.6186C13.5198 19.2072 13.0441 19.662 12.489 19.662C11.9338 19.662 11.4581 19.2072 11.4581 18.6186C11.4581 18.0299 11.9338 17.5751 12.489 17.5751C13.0439 17.5751 13.5198 18.0299 13.5198 18.6186Z" fill="#7D7D8D"/>
                    </svg>
                </div>
                <div className={ `${(form.formState.isValid) ?'text-[#4c6ff2]': 'text-[#7d7d8d]'}  text-base font-bold leading-normal` }>
                    {t("Filter by Date")}
                </div>
            </div> 
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
            <Calendar 
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(e: any) => {
                    setDate(e);
                    form.setValue('start_date', e?.from);
                    form.trigger('start_date');
                    form.setValue('end_date', e?.to);
                    form.trigger('end_date');
                    if (e && form.formState.isValid)
                        loadPage(1);
                }}
                numberOfMonths={2}
            />
            </PopoverContent>
          </Popover>

          <Form {...form} >
          <form suppressHydrationWarning={true} onSubmit={form.handleSubmit(onSubmit)}>
              { (form.getValues().start_date && form.getValues().end_date) && <div className="w-full gap-2.5 inline-flex mb-4">
                  <div className="grow shrink basis-0 flex-col gap-[7px] inline-flex">
                    
                  <FormDateTimeInput
                                        name="start_date"
                                        label="Select date"
                                        form={form as any}
                                        onChange={() => handleManualSubmit() }
                                        />
                                        {/*<FormDateInput
                              name='start_date'
                              label='Select date'
                              form={form as any}
                              onChange={() => handleManualSubmit() }
                              />*/}
                  </div>
                  <div className="grow shrink basis-0 flex-col gap-[7px] inline-flex">

                        <FormDateTimeInput
                                        name="end_date"
                                        label="Select date"
                                        form={form as any}
                                        onChange={() => handleManualSubmit() }
                                        />
                                        
                        {/*<FormDateInput
                              name='end_date'
                              label='Select date'
                              form={form as any}
                              onChange={() => handleManualSubmit()}
                              />*/}
                  </div>
              </div> }
                    
          </form>
          </Form>

          {candidateWorkingDates.map(({ name, resources }: { name:string, resources: CandidateWorkingDate[]}) => (
          <>
              <div key={name} className="text-black text-2xl font-bold pb-6 leading-loose">{name}</div>

              {resources.map((candidateWorkingDate: CandidateWorkingDate) => (
                  <WorkLogDay key={candidateWorkingDate.date} candidateWorkingDate={candidateWorkingDate} />
              ))}
          </>)) }

          {loading && <div className="progress-bar">{t("Loading...")}</div>}

          <Pager pagination={pagination} loadPage={loadPage} />
        
      </div>
      </DashLayout>
    </Suspense>
  );
};

export default LogDateListPage;