import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { gql } from "graphql-tag";
import prisma from "@/lib/prisma";
import { nomiReverseGeocode } from "@/lib/utils";

// 1. Definisikan Schema (TypeDefs)
const typeDefs = gql`
  type VerifyResponse {
    verified: Boolean!
    totalCheck: Int!
  }

  type Mutation {
    verifyCode(
      serial: String!
      captchaToken: String!
      lat: Float
      long: Float
      city: String
      county: String
      district: String
      subdistrict: String
    ): VerifyResponse
  }

  type Query {
    sayHello: String
  }
`;

// 2. Resolvers
const resolvers = {
  Query: {
    sayHello: () => "Apollo Server v4 is Up and Running!",
  },
  Mutation: {
    verifyCode: async (_: any, args: any) => {
      const { serial, lat, long } = args;
      let addressData = { county: '', city: '', district: '', subdistrict: '' };

      if (lat && long) {
        console.log(`📍 Geocoding started for: ${lat}, ${long}`);
        addressData = await nomiReverseGeocode({ lat, lng: long });
      }

      const serialRecord = await prisma.serialNumber.findUnique({
        where: { serial },
      });

      if (!serialRecord) {
        return { verified: false, totalCheck: 0 };
      }

      const updatedSerial = await prisma.serialNumber.update({
        where: { serial },
        data: { totalCheck: { increment: 1 } },
      });

      await prisma.check.create({
        data: {
          serialNumberId: updatedSerial.id,
          lat: lat as any,
          long: long as any,
          ...addressData
        },
      });

      return {
        verified: true,
        totalCheck: updatedSerial.totalCheck,
      };
    },
  },
};

// 3. Setup Apollo Server v4
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// 4. Export Handler dengan integrasi Next.js
export default startServerAndCreateNextHandler(server, {
  context: async (req, res) => ({ req, res }),
});

// 5. Config tetap sama
export const config = {
  api: {
    bodyParser: false,
  },
};