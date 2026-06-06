/**
 * Philippine Standard Employment Contract Templates
 *
 * These templates comply with Philippine labor law requirements:
 * - Labor Code of the Philippines (Batas Pambansa Bilang 442)
 * - DOLE Rules and Regulations
 * - Minimum mandatory clauses for enforceability
 *
 * All templates include:
 * - Position and duties
 * - Compensation and benefits
 * - Hours of work and rest days
 * - Leave benefits
 * - Termination and separation
 * - Statutory declarations
 */

export const CONTRACT_TEMPLATES = {
  probationary: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18px; font-weight: bold; margin: 0; }
    .header p { margin: 5px 0; font-size: 14px; }
    .section { margin: 20px 0; }
    .section h2 { font-size: 14px; font-weight: bold; margin: 10px 0 5px 0; }
    .section p { margin: 5px 0; font-size: 12px; }
    .signature-block { margin-top: 40px; }
    .signature { margin-top: 30px; display: flex; justify-content: space-around; }
    .sig { text-align: center; width: 40%; }
    .sig-line { border-top: 1px solid #000; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>EMPLOYMENT CONTRACT</h1>
    <p>(PROBATIONARY)</p>
    <p style="margin-top: 20px; font-size: 12px;">
      THIS AGREEMENT made and entered into on {{date_signed}} in {{work_location}}, Philippines
    </p>
  </div>

  <div class="section">
    <h2>BETWEEN:</h2>
    <p>
      <strong>{{company_name}}</strong>, a corporation duly organized and existing under Philippine laws,
      with principal office at {{company_address}},<br/>
      represented by its authorized representative, hereinafter referred to as the <strong>"EMPLOYER"</strong>
    </p>
    <p style="margin-top: 20px;">AND</p>
    <p>
      <strong>{{employee_name}}</strong>, {{employee_age}} years old, {{employee_citizenship}} citizen,
      residing at {{employee_address}},<br/>
      hereinafter referred to as the <strong>"EMPLOYEE"</strong>
    </p>
  </div>

  <div class="section">
    <h2>WHEREAS:</h2>
    <p>
      The EMPLOYER is willing to employ the EMPLOYEE, and the EMPLOYEE is willing to be employed by the EMPLOYER,
      on a probationary basis, under the terms and conditions hereinafter set forth.
    </p>
  </div>

  <div class="section">
    <h2>NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained:</h2>

    <div class="section">
      <h2>1. POSITION AND DUTIES</h2>
      <p>
        The EMPLOYER hereby employs the EMPLOYEE as <strong>{{job_title}}</strong> at {{work_location}}.
        The EMPLOYEE shall perform all duties and responsibilities as defined by the EMPLOYER, which may
        be modified from time to time by the EMPLOYER as the business needs require.
      </p>
    </div>

    <div class="section">
      <h2>2. PROBATIONARY PERIOD</h2>
      <p>
        This is a PROBATIONARY employment contract for a period of SIX (6) MONTHS from the date of employment.
        During this period, either party may terminate the employment for any cause or without cause, by giving
        a written notice of at least thirty (30) days or pay in lieu of notice.
      </p>
      <p>
        Upon satisfactory completion of the probationary period, the EMPLOYEE shall be given a regularization status.
        The EMPLOYER reserves the right to extend the probationary period or to terminate the contract if the
        EMPLOYEE fails to meet the required performance standards.
      </p>
    </div>

    <div class="section">
      <h2>3. COMPENSATION</h2>
      <p>
        The EMPLOYER shall pay the EMPLOYEE a monthly salary of <strong>₱{{formatted_daily_rate}}/day</strong>,
        payable on a {{pay_frequency}} basis. The payment shall be made via {{payment_method}}.
      </p>
      <p>
        All statutory deductions as required by law (SSS, PhilHealth, Pag-IBIG, BIR taxes) shall be deducted
        from the EMPLOYEE's gross salary.
      </p>
    </div>

    <div class="section">
      <h2>4. HOURS OF WORK AND REST DAYS</h2>
      <p>
        The EMPLOYEE shall work {{work_hours}} hours per day from {{shift_start}} to {{shift_end}},
        {{work_days_per_week}} days a week, with a {{break_minutes}}-minute unpaid break.
      </p>
      <p>
        The EMPLOYEE's rest day is {{rest_day}}. Work performed on the rest day shall be compensated in accordance
        with the Philippine Labor Code.
      </p>
    </div>

    <div class="section">
      <h2>5. LEAVE BENEFITS</h2>
      <p>
        The EMPLOYEE is entitled to the following leave benefits per calendar year:
      </p>
      <ul>
        <li>Service Incentive Leave (SIL): 5 days (as per Labor Code Art. 95)</li>
        <li>Vacation Leave (VL): {{vacation_days}} days</li>
        <li>Sick Leave (SL): {{sick_days}} days</li>
        <li>Maternity Leave: As per RA 11210 (if applicable)</li>
        <li>Paternity Leave: 7 days (as per RA 8187)</li>
      </ul>
      <p>
        All leaves must be approved by the EMPLOYER in advance. Unauthorized absences shall not be counted as leave
        and may result in salary deduction or disciplinary action.
      </p>
    </div>

    <div class="section">
      <h2>6. TERMINATION AND SEPARATION</h2>
      <p>
        Either party may terminate this contract by providing written notice of at least {{notice_days}} days
        or by paying the equivalent of {{notice_days}} days' salary in lieu of notice.
      </p>
      <p>
        In case of termination, the EMPLOYEE shall be entitled to all benefits as required by law, including
        settlement of any outstanding receivables and proper documentation of separation.
      </p>
    </div>

    <div class="section">
      <h2>7. CONFIDENTIALITY AND INTELLECTUAL PROPERTY</h2>
      <p>
        The EMPLOYEE shall maintain strict confidentiality of all business information, trade secrets, and
        proprietary data of the EMPLOYER, both during and after employment. Any intellectual property created
        in the course of employment shall be the sole property of the EMPLOYER.
      </p>
    </div>

    <div class="section">
      <h2>8. CODE OF CONDUCT</h2>
      <p>
        The EMPLOYEE shall comply with all company rules, policies, and procedures, including but not limited to
        attendance, punctuality, conduct, and dress code. Violation of company policies may result in disciplinary
        action up to and including termination.
      </p>
    </div>

    <div class="section">
      <h2>9. STATUTORY DECLARATIONS</h2>
      <p>
        Both parties acknowledge that this contract is prepared in compliance with Philippine labor laws and that
        the terms herein are not contrary to law, morality, or public policy.
      </p>
      <p>
        The EMPLOYEE represents that he/she is legally capable of entering into this contract and that all
        information provided is true and accurate.
      </p>
    </div>

    <div class="signature-block">
      <h2>IN WITNESS WHEREOF, the parties have executed this contract on the date first written above.</h2>

      <div class="signature">
        <div class="sig">
          <p><strong>EMPLOYER</strong></p>
          <div class="sig-line"></div>
          <p>{{company_representative}}</p>
          <p>{{company_representative_title}}</p>
        </div>

        <div class="sig">
          <p><strong>EMPLOYEE</strong></p>
          <div class="sig-line"></div>
          <p>{{employee_name}}</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `,

  regular: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18px; font-weight: bold; margin: 0; }
    .header p { margin: 5px 0; font-size: 14px; }
    .section { margin: 20px 0; }
    .section h2 { font-size: 14px; font-weight: bold; margin: 10px 0 5px 0; }
    .section p { margin: 5px 0; font-size: 12px; }
    .signature-block { margin-top: 40px; }
    .signature { margin-top: 30px; display: flex; justify-content: space-around; }
    .sig { text-align: center; width: 40%; }
    .sig-line { border-top: 1px solid #000; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>EMPLOYMENT CONTRACT</h1>
    <p>(REGULAR/PERMANENT)</p>
    <p style="margin-top: 20px; font-size: 12px;">
      THIS AGREEMENT made and entered into on {{date_signed}} in {{work_location}}, Philippines
    </p>
  </div>

  <div class="section">
    <h2>BETWEEN:</h2>
    <p>
      <strong>{{company_name}}</strong>, a corporation duly organized and existing under Philippine laws,
      with principal office at {{company_address}},<br/>
      represented by its authorized representative, hereinafter referred to as the <strong>"EMPLOYER"</strong>
    </p>
    <p style="margin-top: 20px;">AND</p>
    <p>
      <strong>{{employee_name}}</strong>, {{employee_age}} years old, {{employee_citizenship}} citizen,
      residing at {{employee_address}},<br/>
      hereinafter referred to as the <strong>"EMPLOYEE"</strong>
    </p>
  </div>

  <div class="section">
    <h2>WHEREAS:</h2>
    <p>
      The EMPLOYER is willing to employ the EMPLOYEE on a regular/permanent basis, and the EMPLOYEE is willing
      to be employed by the EMPLOYER, under the terms and conditions hereinafter set forth.
    </p>
  </div>

  <div class="section">
    <h2>NOW, THEREFORE, in consideration of the mutual covenants and agreements herein contained:</h2>

    <div class="section">
      <h2>1. POSITION AND DUTIES</h2>
      <p>
        The EMPLOYER hereby employs the EMPLOYEE as <strong>{{job_title}}</strong> at {{work_location}}.
        The EMPLOYEE shall perform all duties and responsibilities as defined by the EMPLOYER, which may
        be modified from time to time by the EMPLOYER as the business needs require.
      </p>
    </div>

    <div class="section">
      <h2>2. NATURE OF EMPLOYMENT</h2>
      <p>
        This is a REGULAR/PERMANENT employment contract, which means the EMPLOYEE shall be entitled to all benefits,
        privileges, and protections of permanent employees under Philippine law.
      </p>
    </div>

    <div class="section">
      <h2>3. COMPENSATION</h2>
      <p>
        The EMPLOYER shall pay the EMPLOYEE a {{compensation_type}} salary of <strong>₱{{formatted_rate}}</strong>,
        payable on a {{pay_frequency}} basis. The payment shall be made via {{payment_method}}.
      </p>
      <p>
        All statutory deductions as required by law (SSS, PhilHealth, Pag-IBIG, BIR taxes) shall be deducted
        from the EMPLOYEE's gross salary.
      </p>
    </div>

    <div class="section">
      <h2>4. HOURS OF WORK AND REST DAYS</h2>
      <p>
        The EMPLOYEE shall work {{work_hours}} hours per day from {{shift_start}} to {{shift_end}},
        {{work_days_per_week}} days a week, with a {{break_minutes}}-minute unpaid break.
      </p>
      <p>
        The EMPLOYEE's rest day is {{rest_day}}. Work performed on the rest day shall be compensated in accordance
        with the Philippine Labor Code.
      </p>
    </div>

    <div class="section">
      <h2>5. LEAVE BENEFITS</h2>
      <p>
        The EMPLOYEE is entitled to the following leave benefits per calendar year:
      </p>
      <ul>
        <li>Service Incentive Leave (SIL): 5 days (as per Labor Code Art. 95)</li>
        <li>Vacation Leave (VL): {{vacation_days}} days</li>
        <li>Sick Leave (SL): {{sick_days}} days</li>
        <li>Maternity Leave: As per RA 11210 (if applicable)</li>
        <li>Paternity Leave: 7 days (as per RA 8187)</li>
      </ul>
      <p>
        All leaves must be approved by the EMPLOYER in advance. Unauthorized absences shall not be counted as leave
        and may result in salary deduction or disciplinary action.
      </p>
    </div>

    <div class="section">
      <h2>6. SEPARATION BENEFITS</h2>
      <p>
        In case of termination without cause after six (6) months of service, the EMPLOYEE shall be entitled to
        separation pay equivalent to one (1) month salary for every year of service, as provided by law.
      </p>
    </div>

    <div class="section">
      <h2>7. CONFIDENTIALITY AND INTELLECTUAL PROPERTY</h2>
      <p>
        The EMPLOYEE shall maintain strict confidentiality of all business information, trade secrets, and
        proprietary data of the EMPLOYER, both during and after employment. Any intellectual property created
        in the course of employment shall be the sole property of the EMPLOYER.
      </p>
    </div>

    <div class="section">
      <h2>8. CODE OF CONDUCT</h2>
      <p>
        The EMPLOYEE shall comply with all company rules, policies, and procedures. Violation of company policies
        may result in disciplinary action up to and including termination for just cause.
      </p>
    </div>

    <div class="signature-block">
      <h2>IN WITNESS WHEREOF, the parties have executed this contract on the date first written above.</h2>

      <div class="signature">
        <div class="sig">
          <p><strong>EMPLOYER</strong></p>
          <div class="sig-line"></div>
          <p>{{company_representative}}</p>
          <p>{{company_representative_title}}</p>
        </div>

        <div class="sig">
          <p><strong>EMPLOYEE</strong></p>
          <div class="sig-line"></div>
          <p>{{employee_name}}</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
  `,

  project_based: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18px; font-weight: bold; margin: 0; }
    .header p { margin: 5px 0; font-size: 14px; }
    .section { margin: 20px 0; }
    .section h2 { font-size: 14px; font-weight: bold; margin: 10px 0 5px 0; }
    .section p { margin: 5px 0; font-size: 12px; }
    .signature { margin-top: 40px; display: flex; justify-content: space-around; }
    .sig { text-align: center; width: 40%; }
    .sig-line { border-top: 1px solid #000; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>PROJECT-BASED EMPLOYMENT CONTRACT</h1>
    <p style="margin-top: 20px; font-size: 12px;">
      THIS AGREEMENT made and entered into on {{date_signed}} in {{work_location}}, Philippines
    </p>
  </div>

  <div class="section">
    <h2>BETWEEN:</h2>
    <p>
      <strong>{{company_name}}</strong>, a corporation duly organized and existing under Philippine laws,
      with principal office at {{company_address}},<br/>
      represented by its authorized representative, hereinafter referred to as the <strong>"EMPLOYER"</strong>
    </p>
    <p style="margin-top: 20px;">AND</p>
    <p>
      <strong>{{employee_name}}</strong>, {{employee_age}} years old, {{employee_citizenship}} citizen,
      residing at {{employee_address}},<br/>
      hereinafter referred to as the <strong>"EMPLOYEE"</strong>
    </p>
  </div>

  <div class="section">
    <h2>1. PROJECT SCOPE AND DURATION</h2>
    <p>
      The EMPLOYEE is hired on a project-based contract for the following project:
    </p>
    <p>
      <strong>Project Name:</strong> {{project_name}}<br/>
      <strong>Project Duration:</strong> {{project_start_date}} to {{project_end_date}}<br/>
      <strong>Position:</strong> {{job_title}}
    </p>
  </div>

  <div class="section">
    <h2>2. COMPENSATION</h2>
    <p>
      The EMPLOYER shall pay the EMPLOYEE a project fee of <strong>₱{{total_project_fee}}</strong>,
      payable on a {{payment_schedule}} basis upon completion of milestones.
    </p>
  </div>

  <div class="section">
    <h2>3. TERMINATION</h2>
    <p>
      This contract automatically terminates upon completion of the project or {{project_end_date}},
      whichever comes first. The EMPLOYEE shall not be entitled to separation benefits as per
      Labor Code provisions on project-based employment.
    </p>
  </div>

  <div class="section">
    <h2>4. BENEFITS</h2>
    <p>
      The EMPLOYEE shall be entitled to statutory benefits only as provided by law for
      project-based employees (SSS, PhilHealth, Pag-IBIG, but no SIL until next hire).
    </p>
  </div>

  <div class="signature">
    <div class="sig">
      <p><strong>EMPLOYER</strong></p>
      <div class="sig-line"></div>
      <p>{{company_representative}}</p>
      <p>{{company_representative_title}}</p>
    </div>

    <div class="sig">
      <p><strong>EMPLOYEE</strong></p>
      <div class="sig-line"></div>
      <p>{{employee_name}}</p>
    </div>
  </div>
</body>
</html>
  `,

  casual: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18px; font-weight: bold; margin: 0; }
    .section { margin: 20px 0; }
    .section h2 { font-size: 14px; font-weight: bold; margin: 10px 0 5px 0; }
    .section p { margin: 5px 0; font-size: 12px; }
    .signature { margin-top: 40px; display: flex; justify-content: space-around; }
    .sig { text-align: center; width: 40%; }
    .sig-line { border-top: 1px solid #000; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CASUAL EMPLOYMENT CONTRACT</h1>
    <p style="margin-top: 20px; font-size: 12px;">
      THIS AGREEMENT made and entered into on {{date_signed}} in {{work_location}}, Philippines
    </p>
  </div>

  <div class="section">
    <h2>BETWEEN:</h2>
    <p>
      <strong>{{company_name}}</strong> and <strong>{{employee_name}}</strong>
    </p>
  </div>

  <div class="section">
    <h2>1. CASUAL EMPLOYMENT</h2>
    <p>
      The EMPLOYEE is hired on a casual basis for work of a temporary or seasonal nature.
      The EMPLOYER may terminate this contract anytime without cause, and the EMPLOYEE may
      resign anytime without notice.
    </p>
  </div>

  <div class="section">
    <h2>2. COMPENSATION</h2>
    <p>
      Daily Rate: <strong>₱{{daily_rate}}</strong><br/>
      Payment: {{payment_frequency}}
    </p>
  </div>

  <div class="section">
    <h2>3. BENEFITS</h2>
    <p>
      As a casual employee, the EMPLOYEE is not entitled to SIL, VL, SL, or separation pay,
      but shall receive statutory minimum wage and statutory contributions (SSS, PhilHealth, Pag-IBIG).
    </p>
  </div>

  <div class="signature">
    <div class="sig">
      <p><strong>EMPLOYER</strong></p>
      <div class="sig-line"></div>
      <p>{{company_representative}}</p>
    </div>

    <div class="sig">
      <p><strong>EMPLOYEE</strong></p>
      <div class="sig-line"></div>
      <p>{{employee_name}}</p>
    </div>
  </div>
</body>
</html>
  `,

  fixed_term: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18px; font-weight: bold; margin: 0; }
    .section { margin: 20px 0; }
    .section h2 { font-size: 14px; font-weight: bold; margin: 10px 0 5px 0; }
    .section p { margin: 5px 0; font-size: 12px; }
    .signature { margin-top: 40px; display: flex; justify-content: space-around; }
    .sig { text-align: center; width: 40%; }
    .sig-line { border-top: 1px solid #000; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>FIXED-TERM EMPLOYMENT CONTRACT</h1>
    <p style="margin-top: 20px; font-size: 12px;">
      THIS AGREEMENT made and entered into on {{date_signed}} in {{work_location}}, Philippines
    </p>
  </div>

  <div class="section">
    <h2>BETWEEN:</h2>
    <p>
      <strong>{{company_name}}</strong> and <strong>{{employee_name}}</strong>
    </p>
  </div>

  <div class="section">
    <h2>1. FIXED-TERM EMPLOYMENT</h2>
    <p>
      The EMPLOYEE is hired on a fixed-term basis for a period of <strong>{{contract_duration}}</strong>
      from {{contract_start_date}} to {{contract_end_date}}.
    </p>
  </div>

  <div class="section">
    <h2>2. COMPENSATION</h2>
    <p>
      Monthly Salary: <strong>₱{{monthly_salary}}</strong><br/>
      Payment: {{payment_frequency}}
    </p>
  </div>

  <div class="section">
    <h2>3. RENEWAL</h2>
    <p>
      The EMPLOYER shall not be obliged to renew this contract upon its expiration.
      If the EMPLOYEE is rehired beyond one (1) year of service, the EMPLOYEE shall be considered
      a regular employee.
    </p>
  </div>

  <div class="signature">
    <div class="sig">
      <p><strong>EMPLOYER</strong></p>
      <div class="sig-line"></div>
      <p>{{company_representative}}</p>
    </div>

    <div class="sig">
      <p><strong>EMPLOYEE</strong></p>
      <div class="sig-line"></div>
      <p>{{employee_name}}</p>
    </div>
  </div>
</body>
</html>
  `,

  contractual: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .header h1 { font-size: 18px; font-weight: bold; margin: 0; }
    .section { margin: 20px 0; }
    .section h2 { font-size: 14px; font-weight: bold; margin: 10px 0 5px 0; }
    .section p { margin: 5px 0; font-size: 12px; }
    .signature { margin-top: 40px; display: flex; justify-content: space-around; }
    .sig { text-align: center; width: 40%; }
    .sig-line { border-top: 1px solid #000; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRACTUAL EMPLOYMENT AGREEMENT</h1>
    <p style="margin-top: 20px; font-size: 12px;">
      THIS AGREEMENT made and entered into on {{date_signed}} in {{work_location}}, Philippines
    </p>
  </div>

  <div class="section">
    <h2>BETWEEN:</h2>
    <p>
      <strong>{{company_name}}</strong> and <strong>{{employee_name}}</strong>
    </p>
  </div>

  <div class="section">
    <h2>1. CONTRACTUAL SERVICES</h2>
    <p>
      The EMPLOYEE agrees to provide services as {{job_title}} on a contractual basis.
      The specific services, deliverables, and timelines are as mutually agreed between the parties.
    </p>
  </div>

  <div class="section">
    <h2>2. COMPENSATION</h2>
    <p>
      Fee: <strong>₱{{contract_fee}}</strong><br/>
      Payment Terms: {{payment_terms}}
    </p>
  </div>

  <div class="section">
    <h2>3. TERM</h2>
    <p>
      This contract is for a period of {{contract_duration}}, commencing on {{contract_start_date}}
      and ending on {{contract_end_date}}, unless terminated earlier by mutual agreement.
    </p>
  </div>

  <div class="section">
    <h2>4. CLASSIFICATION</h2>
    <p>
      The EMPLOYEE is classified as a contractual/independent contractor and is not entitled to
      employee benefits except as required by law (SSS, PhilHealth, Pag-IBIG contributions may apply
      depending on the nature of the contract and income level).
    </p>
  </div>

  <div class="signature">
    <div class="sig">
      <p><strong>EMPLOYER</strong></p>
      <div class="sig-line"></div>
      <p>{{company_representative}}</p>
    </div>

    <div class="sig">
      <p><strong>EMPLOYEE</strong></p>
      <div class="sig-line"></div>
      <p>{{employee_name}}</p>
    </div>
  </div>
</body>
</html>
  `,
}

/**
 * Get contract template by type
 * @param contractType - Type of contract
 * @returns HTML template string with {{placeholders}}
 */
export function getContractTemplate(
  contractType:
    | 'probationary'
    | 'regular'
    | 'project_based'
    | 'casual'
    | 'fixed_term'
    | 'contractual',
): string {
  return CONTRACT_TEMPLATES[contractType] ?? CONTRACT_TEMPLATES.regular
}

/**
 * Contract data interface for template interpolation
 */
export interface ContractData {
  // Company info
  company_name: string
  company_address: string
  company_representative: string
  company_representative_title: string

  // Employee info
  employee_name: string
  employee_age: string
  employee_citizenship: string
  employee_address: string

  // Employment details
  job_title: string
  work_location: string
  date_signed: string
  shift_start: string
  shift_end: string
  work_hours: string
  work_days_per_week: string
  rest_day: string
  break_minutes: string

  // Compensation
  compensation_type?: string
  formatted_daily_rate?: string
  formatted_rate?: string
  monthly_salary?: string
  daily_rate?: string
  total_project_fee?: string
  contract_fee?: string

  // Leave
  vacation_days?: string
  sick_days?: string

  // Duration
  notice_days?: string
  contract_duration?: string
  project_name?: string
  project_start_date?: string
  project_end_date?: string
  contract_start_date?: string
  contract_end_date?: string
  payment_schedule?: string
  payment_method?: string
  payment_frequency?: string
  payment_terms?: string
}
