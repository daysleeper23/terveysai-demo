export function generateAIQuestions(ehrData: any): string[] {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  const questions: string[] = [];

  // Extract personal details
  const patientName = ehrData.Personal?.name[0]?.given.join(" ");
  // const preferredLanguage =
  // ehrData.Personal?.communication[0]?.language.coding[0]?.code;
  const age =
    new Date().getFullYear() -
    new Date(ehrData.Personal?.birthDate).getFullYear();

  // Existing medical condition (Diabetes Example)
  const hasDiabetes = ehrData.Clinical?.some(
    (condition: any) => condition.code.coding[0]?.code === "E11" // eslint-disable-line @typescript-eslint/no-explicit-any
  );

  // Current medications
  const medicationList = ehrData.Medication?.map(
    (med: any) => med.medicationCodeableConcept.coding[0]?.display // eslint-disable-line @typescript-eslint/no-explicit-any
  );

  // Lab results (Blood Glucose Example)
  const bloodGlucose = ehrData.LabTest?.find(
    (test: any) => test.code.coding[0]?.code === "15074-8" // eslint-disable-line @typescript-eslint/no-explicit-any
  )?.valueQuantity?.value;

  // 🏥 Generate AI-driven health questions
  questions.push(`Hello ${patientName}, how have you been feeling lately?`);
  questions.push(
    `Based on your records, I see you are ${age} years old. Do you have any new symptoms?`
  );

  if (hasDiabetes) {
    questions.push(
      `I noticed you have Type 2 Diabetes. Have you experienced dizziness or fatigue recently?`
    );
  }

  if (medicationList.length > 0) {
    questions.push(
      `You're currently taking ${medicationList.join(
        ", "
      )}. Have you noticed any side effects?`
    );
  }

  if (bloodGlucose) {
    questions.push(
      `Your latest blood glucose reading was ${bloodGlucose} mmol/L. Have you been monitoring your sugar intake?`
    );
  }

  return questions;
}
