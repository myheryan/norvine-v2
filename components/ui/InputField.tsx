import { useFormContext } from 'react-hook-form'

interface InputFieldProps {
  id: string;
  placeholder: string;
  col?: string;
  type?: string;
  isTextarea?: boolean;
}

export default function InputField({ id, placeholder, col, type = "text", isTextarea = false }: InputFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  const errorMsg = errors[id]?.message as string | undefined;

  return (
    <div className={col}>
      {isTextarea ? (
        <textarea
          {...register(id)}
          rows={2}
          placeholder={placeholder}
          className={`w-full text-xs md:text-sm p-2 md:px-3 border rounded outline-none focus:border-slate-400 resize-none ${errorMsg ? 'border-red-500' : 'border-slate-200'}`}
        />
      ) : (
        <input
          {...register(id)}
          type={type}
          placeholder={placeholder}
          className={`w-full text-xs md:text-sm p-2 md:px-3 border rounded outline-none focus:border-slate-400 ${errorMsg ? 'border-red-500' : 'border-slate-200'}`}
        />
      )}
      {errorMsg && <p className="text-[10px] text-red-500 mt-1">{errorMsg}</p>}
    </div>
  )
}