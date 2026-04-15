import { gql } from '@apollo/client'

export const CONTACT_US = gql`
  mutation ContactUs($name: String!, $email: String!, $message: String!) {
    contactUs(name: $name, email: $email, message: $message) {
      success
    }
  }
`

export type ContactUsVariable = {
  name: string
  email: string
  message: string
}

export type ContactUsResponse = {
  contactUs: {
    success: boolean
  }
}

export const CHECK_SERIAL = gql`
  mutation CheckSerial(
    $serial: String!
    $captchaToken: String!
    $lat: Float
    $long: Float
  ) {
    verifyCode(
      serial: $serial
      captchaToken: $captchaToken
      lat: $lat
      long: $long
    ) {
      verified
      totalCheck
    }
  }
`

export type CheckSerialVariable = {
  serial: string
  captchaToken: string
  lat?: number
  long?: number
}

export type CheckSerialResponse = {
  verifyCode: {
    verified: boolean
    totalCheck: number
  }
}
