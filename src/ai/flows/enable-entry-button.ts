'use server';

/**
 * @fileOverview A flow to enable or disable the entry button based on the privacy policy checkbox.
 *
 * - enableEntryButton - A function that determines whether the entry button should be enabled or disabled.
 * - EnableEntryButtonInput - The input type for the enableEntryButton function.
 * - EnableEntryButtonOutput - The return type for the enableEntryButton function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnableEntryButtonInputSchema = z.object({
  privacyPolicyAccepted: z
    .boolean()
    .describe('Whether the privacy policy has been accepted.'),
});
export type EnableEntryButtonInput = z.infer<typeof EnableEntryButtonInputSchema>;

const EnableEntryButtonOutputSchema = z.object({
  enabled: z.boolean().describe('Whether the entry button should be enabled.'),
});
export type EnableEntryButtonOutput = z.infer<typeof EnableEntryButtonOutputSchema>;

export async function enableEntryButton(input: EnableEntryButtonInput): Promise<EnableEntryButtonOutput> {
  return enableEntryButtonFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enableEntryButtonPrompt',
  input: {schema: EnableEntryButtonInputSchema},
  output: {schema: EnableEntryButtonOutputSchema},
  prompt: `Based on whether the user has accepted the privacy policy, determine if the entry button should be enabled.

Privacy policy accepted: {{{privacyPolicyAccepted}}}

Return true if the privacy policy is accepted, and false if it is not.`,
});

const enableEntryButtonFlow = ai.defineFlow(
  {
    name: 'enableEntryButtonFlow',
    inputSchema: EnableEntryButtonInputSchema,
    outputSchema: EnableEntryButtonOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
