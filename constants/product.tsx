
export const categories = {
  'general-health': {
    name: 'General Health',
  },
  'bones-muscles-joints-health': {
    name: 'Bones, muscles & joints health',
  },
  'heart-health': {
    name: 'Heart health',
  },
  'skin-health': {
    name: 'Skin health',
  },
  'energy-vitality': {
    name: 'Energy & vitality',
  },
  'brain-health-memory': {
    name: 'Brain health & memory',
  },
  'hair-care': {
    name: 'Hair care',
  }
}
export type CategoryId = keyof typeof categories

export const filters = {
  vitamin: { name: 'Vitamin' },
  herbal: { name: 'Herbal' },
  mineral: { name: 'Mineral' },
  'asam-amino': { name: 'Asam Amino' },
  'minyak-ikan': { name: 'Minyak Ikan' },
}
export type FilterId = keyof typeof filters

export type Product = {
  key: string
  regNumber?: string
  name: string
  price: number | Record<string, number> // Field harga ditambahkan di sini
  category: Array<CategoryId>
  shortDescription: string
  thumbnailDescription: string
  description: string
  usage: string
  isUsageAndDose?: boolean
  howMedWorks?: string
  caution: string
  warning?: string
  sideEffect?: string
  interaction?: string
  contraindication?: string
  howToStore?: string
  barcode: string | Record<string, string>
  quantity: Array<string>
  tag: Array<string>
  filters: Array<FilterId>
  composition: Array<{
    name: string
    unit?: string
    subComposition?: Array<{ name: string; unit: string }>
  }>
  customBgColor?: boolean
}

type ProductWithImage = Product &
  Record<
    string,
    {
      front: string
      facts: string
      caution: string
      barcode: string
      back: string
      back2: string
    }
  >