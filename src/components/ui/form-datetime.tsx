import { useEffect, useId, useState } from 'react'
import { 
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { UseFormReturn } from 'react-hook-form'

import { useTranslation } from 'react-i18next'
import i18n from '@/18n';
import { IonDatetime } from '@ionic/react'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { dateTimeFormat } from '@/utils/common'


interface FormInputProps {
  name: string,
  label: string,
  form: UseFormReturn,
  helper?: string,
  inputDir?: string,
  onFocus?: () => void,
  onChange?: (date: any) => void,
  required?: boolean,
  maxDate?: Date
}

export function FormDateTimeInput({
  name,
  label,
  form,
  helper,
  inputDir = i18n.language == "ar"? "rtl": "ltr",
  onFocus,
  onChange,
  required = false,
  maxDate = undefined 
}: FormInputProps) {
  const id = useId()

  const { t } = useTranslation();

  const [formattedValue, setFormattedValue] = useState<string>();
  const [open, setOpen] = useState(false);

  useEffect(() => {
         
    let value = form.getValues(name);

    if (!value) {
      return;
    }

    value =  typeof value == 'string' ? 
      dateTimeFormat(value, 'dd/MM/yyyy') : dateTimeFormat(value.toISOString(), 'dd/MM/yyyy');

    setFormattedValue(value);

  }, [form.watch(name)])
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        
        <FormItem className="relative">
           <Popover open={open} onOpenChange={setOpen}> 
          {/** onClick={() => setOpen(!open)} */}
          <PopoverTrigger asChild>
          <div className="cursor-pointer relative ">

            
              <div className='absolute end-4 top-[22px] z-8'>
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="6.89258" width="14" height="14" rx="4" stroke="#7D7D8D" strokeWidth="2"/>
                <path d="M19 11.8926L5 11.8926" stroke="#7D7D8D" strokeWidth="2"/>
                <rect x="8" y="3.89258" width="2" height="6" rx="1" fill="#7D7D8D"/>
                <rect x="14" y="3.89258" width="2" height="6" rx="1" fill="#7D7D8D"/>
                </svg>           
              </div>
            
            <FormControl>   
              

{/**   {...field}  */}
            <Input
              dir={inputDir}
              value={formattedValue}
              id={id}
              type="text"
              readOnly
              placeholder=" "  // Empty space needed for peer styling
              onFocus={($event) => {
                
                /*if (!formattedValue || formattedValue?.length == 0) {
                  setOpen(true);
                }*/

                onFocus?.();

                //$event.stopPropagation();
              }}
              /*onChange={($event) => {
                onChange?.($event);
              }}*/
              
              className={` bg-white peer h-[72px] py-[16px] px-[24px] border-gray-300 w-full 
                border-[color:var(--Neutral-30,#EEEEF0)] rounded-2xl text-[#23233D]
                placeholder-transparent focus:ring-1
                focus:pt-[32px]
                [&:not(:placeholder-shown)]:pt-[32px]
                ${fieldState.error 
                  ? 'border-destructive focus:border-destructive focus:ring-destructive' 
                  : 'focus:border-primary focus:ring-primary'}`}
            />
            </FormControl>     
            <FormLabel 
                htmlFor={id}
                dir={inputDir}
                className={`absolute z-2 bg-white px-[24px] transition-all duration-200
                  top-1/2 -translate-y-1/2 scale-100
                  text-[color:var(--Neutral-70,#7D7D8D)] text-base font-normal leading-6
                  
                  ${inputDir == "ltr" ? 'start-[1px] peer-focus:start-[6px] peer-[&:not(:placeholder-shown)]:start-[6px] origin-[0]': 
                    'start-[1px] peer-focus:start-[6px] peer-[&:not(:placeholder-shown)]:start-[6px] origin-[100%]'}
    
                  peer-focus:top-3.5 
                  
                  peer-focus:-translate-y-0 peer-focus:scale-75
                  peer-focus:text-[color:var(--Neutral-80,#68687A)] 
                  peer-focus:font-medium 
                  peer-focus:leading-4
                  
                  peer-[&:not(:placeholder-shown)]:top-3.5 
                  peer-[&:not(:placeholder-shown)]:-translate-y-0
                  peer-[&:not(:placeholder-shown)]:scale-75
                  peer-[&:not(:placeholder-shown)]:text-[color:var(--Neutral-80,#68687A)] 
                  peer-[&:not(:placeholder-shown)]:font-medium 
                  peer-[&:not(:placeholder-shown)]:leading-4
    
                  ${fieldState.error ? 'text-destructive' : 'text-gray-500 peer-focus:text-primary'}`}
                  
            >
                {t(label)} {required && <span className='text-destructive'>*</span>}
            </FormLabel>
          </div>
          </PopoverTrigger>
          <PopoverContent>
            
            <IonDatetime name={name}
                  presentation="date"
                  value={
                    field.value instanceof Date
                      ? field.value.toISOString().split('T')[0]
                      : field.value
                        ? new Date(field.value).toISOString().split('T')[0]
                        : new Date().toISOString().split('T')[0]
                  }
                  max={maxDate ? maxDate.toISOString().split('T')[0] : undefined}
                  onIonChange={(e) => {
                    const raw = e.detail.value as string;
                    if (raw) {
                      const date = new Date(raw);
                      field.onChange(date);
                      if (onChange)
                        onChange(e);
                    }
                  }}
              >
              </IonDatetime>  
          </PopoverContent>
          </Popover>
          <FormDescription className='mt-[8px]'>
            { helper }
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}