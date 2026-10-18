
const CHUNKS = [["000100.KS", "000150.KS", "000270.KS", "000660.KS", "000720.KS", "000810.KS", "003230.KS", "003490.KS", "003550.KS", "003670.KS", "005380.KS", "005490.KS", "005830.KS", "005930.KS", "005935.KS", "006400.KS", "009150.KS", "009540.KS", "010120.KS", "010140.KS", "010950.KS", "011200.KS", "012330.KS", "012450.KS", "0175.HK", "018260.KS", "024110.KS", "0267.HK", "028260.KS", "032830.KS", "033780.KS", "034020.KS", "034730.KS", "035420.KS", "035720.KS", "0386.HK", "042660.KS", "042700.KS", "047810.KS", "051910.KS", "0522.HK", "055550.KS", "066570.KS", "068270.KS", "0688.HK", "0700.HK", "079550.KS", "0857.HK", "086280.KS", "086520.KQ", "086790.KS", "090430.KS", "0939.HK", "096770.KS", "0992.HK", "0998.HK", "1024.HK", "105560.KS", "1088.HK", "1093.HK", "1109.HK", "1120.SR", "1177.HK", "1180.SR", "1211.HK", "1211.SR", "1216.TW", "1288.HK", "1295.KL", "1299.HK", "1301.TW", "1303.TW", "1326.TW", "1347.HK", "1378.HK", "138040.KS", "1398.HK", "161390.KS", "1721.T", "1801.HK", "1808.T", "1810.HK", "1818.HK", "1911.T", "1942.T", "1944.T", "1951.T", "196170.KQ", "2015.HK", "2020.HK", "2057.HK", "2059.TW", "207940.KS", "2099.HK", "2181.T", "2222.SR", "2259.HK", "2267.T", "2269.HK", "2269.T", "2282.T", "2301.TW", "2303.TW", "2308.TW", "2317.TW", "2318.HK", "2319.HK", "2327.TW", "2328.HK", "2330.TW", "2344.TW", "2345.TW", "2357.TW", "2359.HK", "2360.TW", "2368.TW", "2371.T", "2376.TW", "2379.TW", "2382.TW", "2383.TW", "2395.TW", "2408.TW", "2412.TW", "2413.T", "2423.HK", "2449.TW", "2454.TW", "247540.KQ", "2501.T", "259960.KS", "2601.HK", "2603.TW", "2628.HK", "267260.KS", "2702.T", "272210.KS", "2768.T", "278470.KS", "2801.TW", "2802.T", "285A.T", "2875.T", "2880.TW", "2881.TW", "2882.TW", "2883.TW", "2884.TW", "2885.TW", "2886.TW"], ["2887.TW", "2890.TW", "2891.TW", "2892.TW", "2897.T", "2899.HK", "2914.T", "298040.KS", "300308.SZ", "300750.SZ", "3008.TW", "3017.TW", "3034.TW", "3037.TW", "3064.T", "3086.T", "3088.T", "3092.T", "3099.T", "3132.T", "316140.KS", "3197.T", "3231.T", "3231.TW", "3281.T", "3283.T", "3288.T", "3289.T", "329180.KS", "3328.HK", "3391.T", "3405.T", "3436.T", "3443.TW", "3462.T", "3481.TW", "3563.T", "3626.T", "3653.TW", "3661.TW", "3665.TW", "3690.HK", "3711.TW", "373220.KS", "3750.HK", "3861.T", "3968.HK", "3988.HK", "3993.HK", "4005.T", "4021.T", "402340.KS", "4042.T", "4062.T", "4063.T", "4088.T", "4182.T", "4183.T", "4186.T", "4203.T", "4204.T", "4324.T", "4403.T", "4502.T", "4503.T", "4506.T", "4519.T", "4527.T", "4528.T", "4536.T", "4568.T", "4578.T", "4704.T", "4732.T", "4751.T", "4912.T", "4938.TW", "4958.TW", "4980.T", "5076.T", "5101.T", "5105.T", "5108.T", "5274.TWO", "5332.T", "5333.T", "5334.T", "5347.TWO", "5393.T", "5406.T", "5411.T", "5711.T", "5802.T", "5803.T", "5830.T", "5831.T", "5832.T", "5838.T", "5844.T", "5876.TW", "5880.TW", "5901.T", "5929.T", "5938.T", "5991.T", "5E2.SI", "600036.SS", "600519.SS", "600900.SS", "6098.T", "6113.T", "6134.T", "6146.T", "6160.HK", "6223.TWO", "6268.T", "6301.T", "6302.T", "6305.T", "6367.T", "6370.T", "642A.T", "6446.TW", "6448.T", "6460.T", "6465.T", "6473.T", "6481.T", "6488.TWO", "6501.T", "6503.T", "6506.T", "6532.T", "6645.T", "6669.TW", "6701.T", "6702.T", "6723.T", "6724.T", "6752.T", "6758.T", "6762.T", "6806.T", "6845.T", "6856.T", "6857.T", "6861.T", "6869.HK", "6869.T", "6954.T"], ["6963.T", "6965.T", "6971.T", "6976.T", "6981.T", "7010.SR", "7011.T", "7167.T", "7180.T", "7182.T", "7189.T", "7203.T", "7261.T", "7267.T", "7276.T", "7282.T", "7327.T", "7337.T", "7459.T", "7701.T", "7729.T", "7741.T", "7747.T", "7751.T", "7752.T", "7762.T", "7769.TW", "7951.T", "7974.T", "8001.T", "8002.T", "8015.T", "8031.T", "8035.T", "8050.T", "8053.T", "8058.T", "8233.T", "8252.T", "8253.T", "8306.T", "8308.T", "8309.T", "8316.T", "8334.T", "8341.T", "8354.T", "8359.T", "8366.T", "8368.T", "8377.T", "8411.T", "8418.T", "8591.T", "8604.T", "8630.T", "8725.T", "8729.T", "8750.T", "8766.T", "8804.T", "8952.T", "8953.T", "8954.T", "8960.T", "8972.T", "8984.T", "8985.T", "9001.T", "9005.T", "9007.T", "9009.T", "9024.T", "9041.T", "9064.T", "9142.T", "9147.T", "9432.T", "9433.T", "9434.T", "9501.T", "9506.T", "9513.T", "9618.HK", "9633.HK", "9684.T", "9888.HK", "9901.HK", "9926.HK", "9961.HK", "9962.T", "9983.T", "9984.T", "9987.HK", "9988.HK", "9992.HK", "9999.HK", "A", "A2A.MI", "AA", "AAK.ST", "AAL", "AAL.L", "AALB.AS", "AAP", "AAPL", "ABAT", "ABBN.SW", "ABBV", "ABCB", "ABDN.L", "ABEV3.SA", "ABG", "ABI.BR", "ABM", "ABNB", "ABSI", "ABT", "ABVX.PA", "ABX.TO", "AC.MX", "AC.PA", "ACA", "ACA.PA", "ACAD", "ACGL", "ACHR", "ACI", "ACIW", "ACKB.BR", "ACLN.SW", "ACLS", "ACM", "ACMR", "ACN", "ACX.MC", "ADANIENT.NS", "ADANIPORTS.NS", "ADANIPOWER.NS", "ADBE", "ADEN.SW", "ADI", "ADM", "ADM.L", "ADMA", "ADP", "ADP.PA", "ADPT", "ADS.DE", "ADSK"], ["AED.BR", "AEE", "AEIS", "AEM", "AEM.TO", "AEO", "AEP", "AES", "AFG", "AFL", "AG", "AGI", "AGI.TO", "AGIO", "AGL.AX", "AGM", "AGNC", "AGO", "AGX", "AGYS", "AHR", "AI.PA", "AIG", "AIR", "AIR.PA", "AIT", "AIXA.DE", "AIZ", "AJBU.SI", "AJG", "AKAM", "AKE.PA", "AKER.OL", "ALA.TO", "ALAB", "ALB", "ALC.SW", "ALD.AX", "ALGN", "ALGT", "ALK", "ALK-B.CO", "ALKS", "ALL", "ALL.AX", "ALLFG.AS", "ALLN.SW", "ALLY", "ALNY", "ALO.PA", "ALOY", "ALPEKA.MX", "ALQ.AX", "ALSEA.MX", "ALSN", "ALSYDB.CO", "ALV", "ALV.DE", "AM.PA", "AMAT", "AMCR", "AMD", "AME", "AMG", "AMGN", "AMH", "AMMN.JK", "AMP", "AMP.AX", "AMR", "AMRZ", "AMSF", "AMT", "AMUN.PA", "AMXB.MX", "AMZN", "AN", "ANAB", "ANDR.VI", "ANET", "ANF", "ANG.JO", "ANGO", "ANN.AX", "ANTM", "ANTO.L", "ANZ.AX", "AON", "AORT", "APA", "APA.AX", "APAM", "APD", "APG", "APH", "APLE", "APO", "APOLLOHOSP.NS", "APP", "APPF", "APTV", "AR", "ARCAD.AS", "ARCB", "ARDX", "ARE", "ARES", "ARGX.BR", "ARHS", "ARIS", "ARKO", "ARM", "ARMK", "AROC", "ARQT", "ARTG.V", "ARW", "ARWR", "ARXS", "ASB", "ASH", "ASIANPAINT.NS", "ASM.AS", "ASML", "ASML.AS", "ASO", "ASSA-B.ST", "ASURB.MX", "ASX.AX", "ATCO-A.ST", "ATD.TO", "ATEC", "ATEN", "ATI", "ATKR", "ATMU", "ATO", "ATO.PA", "ATRC", "ATRO", "ATS.VI", "AU", "AUB", "AUGO", "AUR", "AUTO.L", "AV.L", "AVA", "AVAV", "AVGO"], ["AVNT", "AVOL.SW", "AVTR", "AVY", "AWI", "AWK", "AX", "AXFO.ST", "AXGN", "AXIA3.SA", "AXIA7.SA", "AXISBANK.NS", "AXON", "AXP", "AXS", "AXTI", "AYA", "AYI", "AYV.PA", "AZA.ST", "AZE.BR", "AZJ.AX", "AZM.MI", "AZN.L", "AZO", "AZZ", "B", "B3SA3.SA", "BA", "BA.L", "BAB.L", "BAC", "BAER.SW", "BAH", "BAJAJ-AUTO.NS", "BAJAJFINSV.NS", "BAJFINANCE.NS", "BALD-B.ST", "BALL", "BAM.TO", "BAMNB.AS", "BANB.SW", "BANC", "BANF", "BANR", "BAP", "BARC.L", "BARN.SW", "BAS.DE", "BAS.F", "BATS.L", "BAX", "BAYN.DE", "BB", "BBAJIOO.MX", "BBAS3.SA", "BBCA.JK", "BBD-B.TO", "BBDC3.SA", "BBDC4.SA", "BBIO", "BBNX", "BBOX.L", "BBSE3.SA", "BBT", "BBVA.MC", "BBW", "BBWI", "BBY", "BBY.L", "BC.MI", "BC8.DE", "BCO", "BCPC", "BCRX", "BCVN.SW", "BDC", "BDX", "BDXA", "BE", "BEAM", "BEAN.SW", "BEI.DE", "BEL.NS", "BEN.AX", "BETA", "BEZQ.TA", "BF-B", "BFC", "BFH", "BFLY", "BG", "BGC", "BGEO.L", "BGN.MI", "BHARTIARTL.NS", "BHF", "BHP.AX", "BHVN", "BIG.TA", "BIIB", "BILL", "BIM.PA", "BIMBOA.MX", "BIPC", "BJ", "BKE", "BKG.L", "BKH", "BKNG", "BKR", "BKU", "BKV", "BKW.SW", "BLDR", "BLK", "BLND.L", "BME.L", "BMI", "BMNR", "BMO.TO", "BMRN", "BMW.DE", "BMY", "BN.PA", "BN.TO", "BNL", "BNP.PA", "BNR.DE", "BNS.TO", "BNY", "BNZL.L", "BOBS", "BOH", "BOKF", "BOLSAA.MX", "BOOT", "BOQ.AX", "BOX", "BP.L", "BPAC11.SA", "BPOP", "BR", "BRAV.ST", "BRBY.L", "BRK-B", "BRMS.JK", "BRO", "BSE.NS", "BSL.AX"], ["BSX", "BSY", "BT-A.L", "BTG", "BTRW.L", "BTSG", "BTU", "BURL", "BUSE", "BVI.PA", "BVN", "BWA", "BWIN", "BWXT", "BWY.L", "BX", "BXB.AX", "BXP", "BY", "BZH", "C", "CA.PA", "CABK.MC", "CACI", "CAG", "CAH", "CAKE", "CAL", "CALM", "CAMT.TA", "CAP.PA", "CAR", "CAR.AX", "CARE", "CARR", "CART", "CASH", "CAST.ST", "CASY", "CAT", "CATY", "CB", "CBA.AX", "CBC", "CBK.DE", "CBLL", "CBOE", "CBRE", "CBSH", "CBT", "CBU", "CCBG", "CCC", "CCC.L", "CCH.L", "CCI", "CCK", "CCL", "CCO.TO", "CCS", "CDA.AX", "CDE", "CDNA", "CDNS", "CDP", "CDRE", "CDW", "CE", "CEG", "CELC", "CEMEXCPO.MX", "CENX", "CF", "CFG", "CFR", "CFR.SW", "CG", "CGAU", "CGF.AX", "CGNX", "CGON", "CHC.AX", "CHCO", "CHD", "CHEF", "CHKP", "CHOLAFIN.NS", "CHRD", "CHRW", "CHTR", "CHWY", "CI", "CIEN", "CIFR", "CINF", "CIPLA.NS", "CL", "CLBK", "CLDX", "CLF", "CLH", "CLIS.TA", "CLMT", "CLS.TO", "CLX", "CM.TO", "CMBN.SW", "CMC", "CMCSA", "CME", "CMG", "CMI", "CMIG4.SA", "CMM.AX", "CMP", "CMS", "CNA", "CNA.L", "CNC", "CNH", "CNK", "CNMD", "CNO", "CNOB", "CNP", "CNQ.TO", "CNR", "CNR.TO", "CNS", "CNX", "COALINDIA.NS", "COF", "COGT", "COH.AX", "COHR", "COIN", "COKE", "COL.AX", "COLB", "COMP", "CON", "CON.DE", "COO", "COP", "COR", "CORT", "CORZ", "COST", "COTN.SW", "COV.PA"], ["CP.TO", "CPAY", "CPB", "CPF", "CPFE3.SA", "CPG.L", "CPI.JO", "CPK", "CPLE3.SA", "CPNG", "CPRT", "CPT", "CPU.AX", "CR", "CRBG", "CRC", "CRCL", "CRDA.L", "CRGY", "CRH", "CRK", "CRL", "CRM", "CRS", "CRSP", "CRWD", "CS.PA", "CSCO", "CSGP", "CSL", "CSL.AX", "CSTM", "CSU.TO", "CSW", "CSX", "CTAS", "CTEC.L", "CTGO", "CTRE", "CTRN", "CTSH", "CUBI", "CUMMINSIND.NS", "CURB", "CVBF", "CVCO", "CVE.TO", "CVI", "CVLG", "CVLT", "CVNA", "CVS", "CVSA", "CVX", "CW", "CWEN", "CWH", "CWK", "CWK.L", "CWST", "CWT", "CWY.AX", "CXSE3.SA", "CXW", "CYTK", "CZR", "D", "D05.SI", "DAL", "DANHOS13.MX", "DANSKE.CO", "DAR", "DASH", "DAVE", "DB1.DE", "DBK.DE", "DBX", "DC", "DCC.L", "DCI", "DCO", "DCOM", "DDOG", "DDS", "DE", "DEC", "DECK", "DELL", "DELTA-R.BK", "DFH", "DFTX", "DG", "DG.PA", "DGE.L", "DGX", "DHER.DE", "DHI", "DHL.DE", "DHR", "DIM.PA", "DINO", "DIOD", "DIS", "DIVISLAB.NS", "DK", "DKS", "DKSH.SW", "DLB", "DLG.MI", "DLR", "DLTR", "DNL.AX", "DNLI", "DNOW", "DNTH", "DOC", "DOCN", "DOCU", "DOL.TO", "DOV", "DOW", "DOW.AX", "DPLM.L", "DPM.TO", "DPZ", "DRI", "DRREDDY.NS", "DRS", "DRX.L", "DSGX", "DSV.TO", "DSY.PA", "DT", "DTE", "DTE.DE", "DTG.DE", "DTM", "DUK", "DVA", "DVN", "DX", "DXCM", "DXS.AX", "DY", "DYN", "EAT", "EBAY", "EBC", "EBF", "EBS.VI"], ["ECG", "ECHO", "ECL", "ED", "EDEN.PA", "EDV.AX", "EDV.L", "EFSC", "EG", "EGIE3.SA", "EGO", "EGP", "EGY", "EHC", "EICHERMOT.NS", "EIX", "EL", "EL.PA", "ELAN", "ELIS.PA", "ELS", "ELV", "EMA.TO", "EMAAR.AE", "EMBJ3.SA", "EME", "EMG.L", "EMN", "EMR", "EMSN.SW", "EN.PA", "ENB.TO", "ENEL.MI", "ENEV3.SA", "ENG.MC", "ENGI.PA", "ENGI11.SA", "ENI.MI", "ENOV", "ENPH", "ENR.DE", "ENS", "ENSG", "ENT.L", "ENTG", "ENVA", "ENX.PA", "EOAN.DE", "EOG", "EPAM", "EPRT", "EQH", "EQIX", "EQT", "EQTL3.SA", "EQX", "EQX.TO", "ERAS", "ERF.PA", "ERIE", "ES", "ESE", "ESI", "ESNT", "ESQ", "ESS", "ESTC", "ETD", "ETERNAL.NS", "ETN", "ETR", "ETSY", "EVD.DE", "EVK.DE", "EVN.AX", "EVR", "EVRG", "EW", "EWBC", "EXC", "EXE", "EXEL", "EXK", "EXP", "EXPD", "EXPE", "EXPN.L", "EXPO", "EXR", "EYE", "EZJ.L", "F", "FAF", "FANG", "FAST", "FBIN", "FBK", "FBNC", "FBP", "FCF", "FCFS", "FCNCA", "FCX", "FDS", "FDX", "FDXF", "FE", "FEDERALBNK.NS", "FELE", "FEMSAUBD.MX", "FERG", "FFBC", "FFH.TO", "FFIN", "FFIV", "FGR.PA", "FHB", "FHI", "FHN", "FHZN.SW", "FIBI.TA", "FIBK", "FIBRAMQ12.MX", "FIBRAPL14.MX", "FICO", "FIP", "FISV", "FITB", "FIVE", "FIX", "FLEX", "FLG", "FLO", "FLR", "FLS", "FLS.CO", "FLY", "FM.TO", "FME.DE", "FMG.AX", "FMTY14.MX", "FN", "FNB", "FND", "FNF", "FNTN.DE", "FNV", "FNV.TO", "FOX", "FOXA"], ["FPE3.DE", "FPS", "FR.PA", "FRE.DE", "FRES.L", "FRME", "FRO.OL", "FROG", "FRSH", "FRT", "FSLY", "FSM", "FSR.JO", "FSS", "FTAI", "FTDR", "FTI", "FTNT", "FTS.TO", "FTV", "FULT", "FUNO11.MX", "FWONK", "FWRD", "G.MI", "G13.SI", "G1A.DE", "G24.DE", "GABC", "GALD.SW", "GALE.SW", "GAP", "GAPB.MX", "GATX", "GAW.L", "GBCI", "GCARSOA1.MX", "GCC.MX", "GD", "GDDY", "GE", "GEBN.SW", "GEHC", "GEN", "GENTERA.MX", "GEO", "GET.PA", "GETI-B.ST", "GEV", "GEVO", "GF.SW", "GFC.PA", "GFF", "GFI", "GFI.JO", "GFINBURO.MX", "GFL.TO", "GFNORTEO.MX", "GGBR4.SA", "GGG", "GGP.AX", "GHC", "GIB-A.TO", "GILD", "GIS", "GIVN.SW", "GKOS", "GL", "GL9.IR", "GLBE", "GLE.PA", "GLEN.L", "GLNG", "GLPI", "GLW", "GM", "GMD.AX", "GME", "GMED", "GMEXICOB.MX", "GMG.AX", "GMIN.TO", "GNK", "GNRC", "GNW", "GO", "GOOG", "GOOGL", "GPC", "GPI", "GPOR", "GPRE", "GPT.AX", "GRAL", "GRASIM.NS", "GRBK", "GRF.MC", "GRG.L", "GRMN", "GRPN", "GRUMAB.MX", "GS", "GSK.L", "GTES", "GTLB", "GTT.PA", "GTX", "GVA", "GVMXX", "GWO.TO", "GWRE", "GWW", "GXO", "H.TO", "HAE", "HAFC", "HAG.DE", "HAL", "HAL.NS", "HALO", "HAS", "HASI", "HAYW", "HBAN", "HBAN.SW", "HBNC", "HBR.L", "HCA", "HCC", "HCLTECH.NS", "HD", "HDFCBANK.NS", "HEI", "HEI-A", "HEI.DE", "HEN.DE", "HEN3.DE", "HER.MI", "HEROMOTOCO.NS", "HIG", "HII", "HIK.L", "HILS.L", "HIMS", "HINDALCO.NS", "HINDUNILVR.NS", "HIW", "HL", "HLMA.L", "HLN.L"], ["HLT", "HMN", "HMY", "HNGE", "HNI", "HNR1.DE", "HO.PA", "HOC.L", "HOLN.SW", "HOMB", "HON", "HONA", "HOOD", "HOPE", "HOT.DE", "HOV", "HP", "HPE", "HPQ", "HQY", "HRI", "HRL", "HSBA.L", "HSIC", "HST", "HSX.L", "HSY", "HTFL", "HTHT", "HTLD", "HTZ", "HUB.AX", "HUBB", "HUBG", "HUBS", "HUH1V.HE", "HUM", "HUT", "HWC", "HWDN.L", "HWM", "HXL", "HYMC", "HZO", "IAG", "IAG.AX", "IAG.TO", "IART", "IBCP", "IBE.MC", "IBKR", "IBM", "IBOC", "IBP", "IBRX", "ICE", "ICG.L", "ICICIBANK.NS", "ICUI", "IDCC", "IDR", "IDXX", "IDYA", "IE", "IEX", "IFC.TO", "IFCN.SW", "IFF", "IFX.DE", "IGG.L", "IHG.L", "III.L", "ILMN", "IMB.L", "IMCD.AS", "IMI.L", "IMKTA", "IMNM", "IMO.TO", "IMVT", "INBX", "INCH.L", "INCY", "INDB", "INDHOTEL.NS", "INDIGO.NS", "INDV", "INF.L", "INFY", "INFY.NS", "INGA.AS", "INSM", "INSP", "INSW", "INTC", "INTU", "INVE-B.ST", "INVH", "INVP.L", "IONS", "IOT", "IOVA", "IP", "IP.MI", "IPAR", "IPN.PA", "IQV", "IR", "IRDM", "IRM", "IRMD", "IRON", "IRT", "IRTC", "ISP.MI", "ISRG", "ISS.CO", "IT", "ITC.NS", "ITGR", "ITRI", "ITRK.L", "ITSA4.SA", "ITT", "ITUB3.SA", "ITUB4.SA", "ITV.L", "ITW", "ITX.MC", "IVG.MI", "IXPZ6", "IXRZ6", "IXYZ6", "J", "JAZZ", "JBH.AX", "JBHT", "JBIO", "JBL", "JBLU", "JBS", "JBTM", "JCI", "JELD", "JLL", "JMAT.L", "JNJ", "JOBY", "JPM", "JSWSTEEL.NS"], ["JXN", "JYSK.CO", "K.TO", "KALU", "KBCA.BR", "KBH", "KBX.DE", "KCR.HE", "KDP", "KER.PA", "KEX", "KEYS", "KFH.KW", "KFY", "KGC", "KGF.L", "KGS", "KHC", "KIM", "KIMBERA.MX", "KKR", "KLAC", "KLBN11.SA", "KLIC", "KLR.L", "KMB", "KMI", "KMPR", "KMTS", "KMX", "KNIN.SW", "KNSA", "KNSL", "KNT.TO", "KNX", "KO", "KOD", "KOFUBL.MX", "KOS", "KOTAKBANK.NS", "KR", "KRG", "KRMN", "KRYS", "KSS", "KTB", "KTOS", "KURA", "KVUE", "KYMR", "L", "L.TO", "LABB.MX", "LACOMERUBC.MX", "LAD", "LAGR-B.ST", "LAMR", "LAUR", "LAURUSLABS.NS", "LDOS", "LECO", "LEG.DE", "LEN", "LEN-B", "LEU", "LFUS", "LGEN.L", "LGIH", "LGND", "LH", "LHA.DE", "LHX", "LI.PA", "LIF", "LII", "LIN", "LISN.SW", "LISP.SW", "LITE", "LIVN", "LKFN", "LKQ", "LLOY.L", "LLY", "LMAT", "LMND", "LMP.L", "LMT", "LNC", "LNT", "LNTH", "LOAR", "LOGN.SW", "LONN.SW", "LOOMIS.ST", "LOW", "LPX", "LR.PA", "LRCX", "LRLCY", "LSCC", "LSEG.L", "LSTR", "LT.NS", "LTH", "LTMC.MI", "LUG.TO", "LULU", "LUMN", "LUN.TO", "LUNR", "LUV", "LVS", "LW", "LXP", "LYB", "LYC.AX", "LYFT", "LYV", "LZB", "M", "M&M.NS", "M44U.SI", "MA", "MAA", "MAC", "MANH", "MANTA.HE", "MAR", "MARA", "MARUTI.NS", "MAS", "MATX", "MAU.TO", "MAXHEALTH.NS", "MBC", "MBG.DE", "MBGL", "MBRF3.SA", "MC", "MC.PA", "MCB", "MCD", "MCHP", "MCK", "MCO", "MCY", "MDGL", "MDLZ", "MDT"], ["MDU", "ME8U.SI", "MEDP", "MEGACPO.MX", "MELI", "MET", "META", "METC", "MFC.TO", "MG.TO", "MGDL.TA", "MGM", "MGOR.TA", "MGR.AX", "MGY", "MHK", "MHO", "MIN.AX", "MING.OL", "MIR", "MIRM", "MKC", "MKL", "MKS.L", "MKSI", "MKTX", "ML.PA", "MLI", "MLM", "MLSR.TA", "MLYS", "MMC", "MMED", "MMHD.TA", "MMM", "MMSI", "MNDI.L", "MNDY", "MNG.L", "MNKD", "MNRO", "MNST", "MO", "MOBN.SW", "MOG-A", "MOH", "MOS", "MOTHERSON.NS", "MOTV3.SA", "MP", "MPC", "MPL.AX", "MPWR", "MQG.AX", "MRCY", "MRK", "MRK.DE", "MRL.MC", "MRNA", "MRO.L", "MRSH", "MRTN", "MRU.TO", "MRVL", "MRX", "MS", "MSCI", "MSFT", "MSGS", "MSI", "MSM", "MSTR", "MT.AS", "MTB", "MTCH", "MTD", "MTDR", "MTH", "MTLN.L", "MTN", "MTN.JO", "MTO.L", "MTRN", "MTSI", "MTUS", "MTX.DE", "MTZ", "MU", "MUR", "MUSA", "MUV2.DE", "MUX", "MWA", "MXL", "MYCR.ST", "MYRG", "MZTI", "NA.TO", "NAB.AX", "NATL", "NBHC", "NBIX", "NBK.KW", "NBN", "NBTB", "NCLH", "NDA-FI.HE", "NDA-SE.ST", "NDA.DE", "NDAQ", "NDSN", "NDX1.DE", "NE", "NEE", "NEM", "NEM.DE", "NEOG", "NESN.SW", "NESTLEIND.NS", "NET", "NEX.PA", "NEXI.MI", "NFLX", "NG.L", "NHI", "NI", "NIC", "NICE.TA", "NJR", "NKE", "NKT.CO", "NKTR", "NLY", "NMIH", "NOC", "NOD.OL", "NOG", "NOKIA.HE", "NOVN.SW", "NOVO-B.CO", "NOVT", "NOW", "NPK", "NPN.JO", "NPO", "NRG", "NRIX", "NSC", "NSIT", "NSP"], ["NST.AX", "NTAP", "NTCT", "NTLA", "NTNX", "NTPC.NS", "NTR.TO", "NTRA", "NTRS", "NTSK", "NU", "NUAI", "NUE", "NVAX", "NVCR", "NVDA", "NVR", "NVST", "NVT", "NWBI", "NWE", "NWG.L", "NWS", "NWSA", "NX", "NXPI", "NXSN.TA", "NXST", "NXT", "NXT.AX", "NXT.L", "NYT", "O", "O39.SI", "OC", "OCFC", "OCTV-SDB.ST", "ODFL", "OFG", "OFIX", "OGC", "OGE", "OGS", "OHI", "OII", "OKE", "OKTA", "OLLI", "OMAB.MX", "OMC", "OMCL", "ON", "ONB", "ONDS", "ONTO", "OPCH", "OPLN", "OR", "OR.PA", "ORA", "ORA.PA", "ORBIA.MX", "ORCL", "ORG.AX", "ORI", "ORI.AX", "ORIC", "ORKA", "ORLY", "ORRF", "OSCR", "OSPN", "OTEX", "OTEX.TO", "OTIS", "OTP.BD", "OTTR", "OUT", "OVV", "OXM", "OXY", "OZK", "P", "P911.DE", "PAAS", "PAAS.TO", "PAF.L", "PAG", "PAH3.DE", "PANW", "PARR", "PATH", "PAYC", "PAYTM.NS", "PAYX", "PAZ.TA", "PB", "PBF", "PCAR", "PCG", "PCOR", "PCVX", "PDD", "PE&OLES.MX", "PECO", "PEG", "PEGA", "PEN", "PEP", "PERSISTENT.NS", "PETR3.SA", "PETR4.SA", "PFBC", "PFE", "PFG", "PFGC", "PFS", "PG", "PGEN", "PGHN.SW", "PGR", "PH", "PHM", "PHP.L", "PI", "PINFRA.MX", "PINS", "PIPR", "PIRC.MI", "PK", "PKG", "PKN.WA", "PKO.WA", "PLD", "PLMR", "PLS.AX", "PLSE", "PLTR", "PLUS.L", "PLXS", "PM", "PME.AX", "PNC", "PNFP", "PNR", "PNW", "PODD", "POOL", "POR", "POW.TO"], ["POWERGRID.NS", "POWL", "PPG", "PPL", "PPL.TO", "PR", "PRAX", "PRCT", "PRI", "PRIM", "PRIO3.SA", "PRK", "PRM", "PRU", "PRU.AX", "PRU.L", "PRX.AS", "PRY.MI", "PSA", "PSMT", "PSN.L", "PSON.L", "PSPN.SW", "PSSA3.SA", "PSX", "PTC", "PTCT", "PTEN", "PTGX", "PTRN", "PUB.PA", "PURR", "PVLA", "PWR", "PYPL", "Q.MX", "QAN.AX", "QBE.AX", "QBTS", "QCOM", "QCRH", "QDEL", "QIA.DE", "QLT.L", "QLYS", "QNBK.QA", "QQ.L", "QSR.TO", "QTWO", "QURE", "R", "R3NK.DE", "RA.MX", "RAA.DE", "RACE.MI", "RADL3.SA", "RAIL3.SA", "RAL", "RAND.AS", "RARE", "RBA", "RBA.TO", "RBC", "RBREW.CO", "RBRK", "RCAT", "RCI-B.TO", "RCL", "RCUS", "RDDT", "RDN", "RDNT", "RDOR3.SA", "RDW", "RDWR", "REA.AX", "REAL", "REG", "REGN", "REL.L", "RELIANCE.NS", "RELY", "RENT3.SA", "REP.MC", "REPL", "REPX", "REX", "REY.MI", "RF", "RGA", "RGEN", "RGLD", "RGR", "RGTI", "RHC.AX", "RHI", "RHM.DE", "RHP", "RI.PA", "RIG", "RILBA.CO", "RIO.AX", "RIO.L", "RIOT", "RITM", "RJF", "RKLB", "RKT.L", "RL", "RLAY", "RLI", "RMBS", "RMD", "RMS.AX", "RMS.PA", "RMV.L", "RNG", "RNO.PA", "RNR", "RNST", "RO.SW", "ROAD", "ROCK", "ROIV", "ROK", "ROKU", "ROP", "ROP.SW", "ROR.L", "ROSE.L", "ROST", "RPD", "RPM", "RPRX", "RR.L", "RRC", "RRL.AX", "RRX", "RS", "RS1.L", "RSG", "RTO.L", "RTX", "RUI.PA", "RUSHA", "RVLV", "RVMD", "RVTY", "RWE.DE", "RXL.PA"], ["RXO", "RXRX", "RY.TO", "RYAN", "RYTM", "RYZ", "S", "S32.AX", "SA", "SAF.PA", "SAGA-B.ST", "SAH", "SAIA", "SAIC", "SAN.MC", "SAN.PA", "SAND.ST", "SANM", "SAP.DE", "SARO", "SAVE.ST", "SB1NO.OL", "SBAC", "SBCF", "SBH", "SBILIFE.NS", "SBIN.NS", "SBK.JO", "SBMO.AS", "SBRA", "SBRY.L", "SBSP3.SA", "SBUX", "SCCO", "SCG.AX", "SCHN.SW", "SCHP.SW", "SCHW", "SCI", "SCMN.SW", "SCR.PA", "SCT.L", "SD", "SDF.AX", "SDLF.L", "SDRL", "SDZ.SW", "SEB-A.ST", "SECT-B.ST", "SEI", "SEIC", "SEK.AX", "SF", "SFBS", "SFIX", "SFM", "SFNC", "SFR.AX", "SFSN.SW", "SFZN.SW", "SGE.L", "SGH.AX", "SGI", "SGO.PA", "SGP.AX", "SGRO.L", "SGSN.SW", "SHEL.L", "SHL.AX", "SHL.DE", "SHOO", "SHOP", "SHOP.TO", "SHRIRAMFIN.NS", "SHW", "SIBN", "SIE.DE", "SIG", "SIG.AX", "SIGI", "SIGMAFA.MX", "SIGN.SW", "SIKA.SW", "SITM", "SJM", "SKE", "SKHY", "SKT", "SKWD", "SKY", "SKYD", "SKYW", "SLAB", "SLB", "SLF.TO", "SLG", "SLHN.SW", "SLS", "SM", "SMIN.L", "SMMT", "SMTC", "SN", "SN.L", "SNA", "SNAP", "SNDK", "SNDR", "SNDX", "SNEX", "SNOW", "SNPS", "SNX", "SO", "SOC", "SOI.PA", "SOL.AX", "SOLS", "SOLV", "SOON.SW", "SOP.PA", "SPCE", "SPCX", "SPG", "SPGI", "SPHR", "SPIE.PA", "SPM.MI", "SPNT", "SPOT", "SPSC", "SPSN.SW", "SPXC", "SQN.SW", "SR", "SRCE", "SRE", "SREN.SW", "SRP.L", "SRPT", "SRRK", "SRT3.DE", "SSAB-B.ST", "SSB", "SSD", "SSE.L", "SSRM", "STAN.L", "STB.OL", "STBA"], ["STC", "STE", "STEP", "STJ.L", "STLD", "STM", "STMN.SW", "STMPA.PA", "STNG", "STO.AX", "STOK", "STRL", "STT", "STX", "STZ", "SU.PA", "SU.TO", "SUBC.OL", "SUI", "SUN.AX", "SUN.SW", "SUNN.SW", "SUNPHARMA.NS", "SUZB3.SA", "SVM", "SVT.L", "SVV", "SW", "SW.PA", "SWBI", "SWX", "SXC", "SXI", "SXT", "SY1.DE", "SYBT", "SYF", "SYK", "SYNA", "SYRE", "SYY", "T", "TALO", "TAP", "TASE.TA", "TATASTEEL.NS", "TBBK", "TCAP.L", "TCBI", "TCBK", "TCL.AX", "TCS.NS", "TD.TO", "TDC", "TDG", "TDS", "TDW", "TDY", "TE.PA", "TEAM", "TECH", "TECHM.NS", "TECK-B.TO", "TECN.SW", "TEL", "TEMN.SW", "TENB", "TEP.PA", "TER", "TEX", "TFC", "TFIN", "TFSL", "TFX", "TGS.OL", "TGT", "TGTX", "THC", "THFF", "THG", "TIH.TO", "TIMS3.SA", "TITAN.NS", "TITN", "TJX", "TKA.DE", "TKO", "TLC.AX", "TLEVISACPO.MX", "TLN", "TLS.AX", "TLX.AX", "TLX.DE", "TMCV.NS", "TMDX", "TMO", "TMUS", "TNDM", "TNE.AX", "TNGX", "TOL", "TORNTPHARM.NS", "TOST", "TOU.TO", "TOWN", "TPC", "TPL", "TPR", "TRAX", "TRENT.NS", "TREX", "TRGP", "TRI.TO", "TRMB", "TRMK", "TRNO", "TROW", "TRP.TO", "TRU", "TRV", "TSCO", "TSCO.L", "TSLA", "TSM", "TSN", "TT", "TTAN", "TTC", "TTD", "TTE.PA", "TTEK", "TTMI", "TTWO", "TUI1.DE", "TVSMOTOR.NS", "TVTX", "TW.L", "TWE.AX", "TWLO", "TWST", "TXG", "TXG.TO", "TXN", "TXNM", "TXRH", "TXT", "TYL", "U", "U14.SI", "U96.SI"], ["UAL", "UAMY", "UBER", "UBSG.SW", "UBSI", "UCB", "UCG.MI", "UDR", "UEC", "UFPI", "UGPA3.SA", "UHAL-B", "UHR.SW", "UHS", "ULCC", "ULTA", "ULTRACEMCO.NS", "ULVR.L", "UMBF", "UMI.BR", "UNF", "UNH", "UNI.MC", "UNM", "UNP", "UPBD", "UPS", "URBN", "URG", "URI", "URW.PA", "USAR", "USB", "USD", "USFD", "UTHR", "UU.L", "V", "V03.SI", "VAC", "VACN.SW", "VAL", "VAL.JO", "VALE3.SA", "VALMT.HE", "VATN.SW", "VAU.AX", "VBBR3.SA", "VCEL", "VCTR", "VCX.AX", "VCYT", "VEEV", "VEND.OL", "VERA", "VESTA.MX", "VG", "VGNT", "VIAV", "VICI", "VIE.PA", "VIR", "VIRT", "VIVT3.SA", "VK.PA", "VKTX", "VLO", "VLTO", "VLY", "VMC", "VMI", "VMRK", "VNA.DE", "VNOM", "VNT.AX", "VOD.L", "VOE.VI", "VOLARA.MX", "VOLV-B.ST", "VONN.SW", "VOW3.DE", "VOYG", "VPK.AS", "VRDN", "VREX", "VRNS", "VRSK", "VRSN", "VRT", "VRTS", "VRTX", "VSAT", "VSEC", "VSH", "VSNT", "VST", "VSXY", "VTR", "VTRS", "VTS", "VVV", "VVX", "VYLR", "VZ", "WAB", "WAFD", "WAL", "WALMEX.MX", "WAT", "WAY", "WBC.AX", "WCC", "WCN", "WCP.TO", "WDAY", "WDC", "WDO.TO", "WDP.BR", "WDS.AX", "WEC", "WEGE3.SA", "WEIR.L", "WELL", "WEN", "WERN", "WES.AX", "WFC", "WGX.AX", "WHC.AX", "WHD", "WINA", "WISE.L", "WIX", "WK", "WKC", "WLK", "WM", "WMB", "WMK", "WMS", "WMT", "WOR.AX", "WOW.AX", "WPC", "WPM", "WPM.TO", "WPP.L", "WRB", "WRBY", "WS"], ["WSBC", "WSFS", "WSM", "WSO", "WSP.TO", "WST", "WTB.L", "WTC.AX", "WTFC", "WTM", "WTRG", "WTS", "WTW", "WU", "WULF", "WWD", "WY", "WYNN", "XEL", "XENE", "XMTR", "XNCR", "XOM", "XP", "XPO", "XRO.AX", "XYL", "XYZ", "YOU", "YSS", "YUM", "ZAL.DE", "ZBH", "ZBIO", "ZBRA", "ZD", "ZEG.L", "ZETA", "ZIM", "ZION", "ZM", "ZS", "ZTS", "ZURN.SW", "ZWS"]];
const fetchAll = async (call, tool, argList, parse) => {
  // a few calls at a time, each retried once; a source fails only if most of its calls fail
  const out = new Array(argList.length);
  let next = 0, failed = 0, lastErr = null;
  const one = async (a) => {
    try { return parse(await call(tool, a)); } catch (e) {
      await new Promise((r) => setTimeout(r, 1200));
      try { return parse(await call(tool, a)); } catch (e2) { failed += 1; lastErr = e2; return []; }
    }
  };
  await Promise.all(Array.from({ length: 4 }, async () => { while (next < argList.length) { const k = next++; out[k] = await one(argList[k]); } }));
  if (failed > argList.length / 2) throw lastErr || new Error('FMP did not answer');
  return out.flat();
};
const parseRows = (a) => (Array.isArray(a) ? a : (a && (a.rows || a.data || a.results)) || []);
dash.loader('etf_history', {
  description: 'Runs the same price-history call for each ETF in the universe, a few at a time, and keeps symbol, date and dividend-adjusted close.',
  fn: async ({ answer, call, args }) => {
    const tickers = ["ACWI", "ACWX", "EFA", "EEM", "RSP", "QQQ", "IWF", "IWD", "IJH", "IJR", "IWM", "IWO", "IWN", "MTUM", "QUAL", "USMV", "SCHD", "EFG", "EFV", "SCZ", "EMXC", "XLK", "XLC", "XLY", "XLP", "XLV", "XLF", "XLI", "XLE", "XLB", "XLU", "XLRE", "SMH", "IGV", "CIBR", "XBI", "IHI", "KRE", "KIE", "ITA", "PAVE", "IYT", "ITB", "XRT", "XOP", "XME", "GDX", "VGK", "EWJ", "EWU", "EWG", "EWQ", "EWL", "EWC", "EWA", "EWT", "EWY", "MCHI", "INDA", "EWZ", "EWW"];
    const first = parseRows(answer);
    if (!first.length) throw new Error('FMP returned no price history for ' + args.symbol);
    const rest = await fetchAll(call, 'chart', tickers.map((symbol) => ({ ...args, symbol })), parseRows);
    return [...first, ...rest].map((r) => ({ symbol: r.symbol, date: String(r.date).slice(0, 10), adjClose: Number(r.adjClose) }));
  },
});
dash.loader('constituent_quotes', {
  description: 'Runs the same batch quote for every holding used in the look-through, in groups, and keeps price, moving averages and 52-week range.',
  fn: async ({ answer, call, args }) => {
    const rest = await fetchAll(call, 'quote', CHUNKS.slice(1).map((symbols) => ({ ...args, symbols })), parseRows);
    return [...parseRows(answer), ...rest].map((r) => ({ symbol: r.symbol, price: Number(r.price), changePercentage: Number(r.changePercentage), priceAvg50: Number(r.priceAvg50), priceAvg200: Number(r.priceAvg200), yearHigh: Number(r.yearHigh), yearLow: Number(r.yearLow) }));
  },
});
dash.calc('tech_metrics', {
  inputs: ['etf_history', 'etf_quotes'],
  title: 'ETF technicals',
  description: 'Returns, momentum, moving-average trend, drawdown, volatility and RSI for each ETF from adjusted prices, with today’s live price.',
  fn: (etf_history, etf_quotes) => {
  const by = {};
  for (const r of etf_history) (by[r.symbol] = by[r.symbol] || []).push({ d: String(r.date).slice(0, 10), p: Number(r.adjClose) });
  const live = {};
  for (const q of etf_quotes) live[q.symbol] = Number(q.price);
  const out = [];
  for (const etf of Object.keys(by)) {
    const s = by[etf].filter((x) => x.p > 0).sort((a, b) => (a.d < b.d ? -1 : 1));
    const p = s.map((x) => x.p);
    const lq = etf_quotes.find((q) => q.symbol === etf);
    const lqd = lq && Number(lq.timestamp) > 0 ? new Date((Number(lq.timestamp) - 4 * 3600) * 1000).toISOString().slice(0, 10) : null;
    if (live[etf] > 0) { if (lqd && lqd > s[s.length - 1].d) { p.push(live[etf]); s.push({ d: lqd, p: live[etf] }); } else p[p.length - 1] = live[etf]; }
    const n = p.length, last = p[n - 1];
    const at = (k) => (n - 1 - k >= 0 ? p[n - 1 - k] : null);
    const ret = (a, b) => (a && b ? a / b - 1 : null);
    const sma = (k) => (n >= k ? p.slice(n - k).reduce((x, y) => x + y, 0) / k : null);
    const sma50 = sma(50), sma200 = sma(200);
    const yr = p.slice(Math.max(0, n - 252));
    const lr = [];
    for (let i = Math.max(1, n - 63); i < n; i++) lr.push(Math.log(p[i] / p[i - 1]));
    const m = lr.reduce((x, y) => x + y, 0) / lr.length;
    const vol = Math.sqrt(lr.reduce((x, y) => x + (y - m) ** 2, 0) / (lr.length - 1)) * Math.sqrt(252);
    let g = 0, l = 0;
    for (let i = 1; i <= 14; i++) { const ch = p[i] - p[i - 1]; g += Math.max(ch, 0); l += Math.max(-ch, 0); }
    g /= 14; l /= 14;
    for (let i = 15; i < n; i++) { const ch = p[i] - p[i - 1]; g = (g * 13 + Math.max(ch, 0)) / 14; l = (l * 13 + Math.max(-ch, 0)) / 14; }
    const ytdBase = s.filter((x) => x.d < s[n - 1].d.slice(0, 4) + '-01-01').pop();
    out.push({
      etf, asOf: s[n - 1].d, price: last,
      ret1m: ret(last, at(21)), ret3m: ret(last, at(63)), ret6m: ret(last, at(126)), ret12m: ret(last, at(252)),
      retYtd: ytdBase ? last / ytdBase.p - 1 : null,
      mom12_1: ret(at(21), at(252)),
      vs200d: sma200 ? last / sma200 - 1 : null,
      sma50vs200: sma50 && sma200 ? sma50 / sma200 - 1 : null,
      drawdown52w: last / Math.max(...yr) - 1,
      vol3m: vol,
      rsi14: l === 0 ? 100 : 100 - 100 / (1 + g / l),
    });
  }
  return out;
},
});
dash.calc('fund_metrics', {
  inputs: ['etf_universe', 'fund_holdings', 'constituents', 'etf_quotes', 'fx'],
  title: 'Look-through fundamentals',
  description: 'Weight-aggregated valuation, growth, quality, dilution, margin trend and currency exposure for each ETF from its largest holdings, repriced by the ETF’s move since the snapshot.',
  fn: (etf_universe, fund_holdings, constituents, etf_quotes, fx) => {
  const FXV = {};
  for (const r of fx || []) FXV[r.currency] = r;
  const c = {};
  for (const r of constituents) c[r.symbol] = r;
  const live = {};
  for (const q of etf_quotes) live[q.symbol] = Number(q.price);
  const clip = (v, a, b) => Math.min(b, Math.max(a, v));
  const num = (v) => (v === null || v === undefined || v === '' || !isFinite(Number(v)) ? null : Number(v));
  const wmed = (pairs) => {
    const s = pairs.filter((x) => x[1] !== null).sort((a, b) => a[1] - b[1]);
    const tot = s.reduce((t, x) => t + x[0], 0);
    let acc = 0;
    for (const [w, v] of s) { acc += w; if (acc >= tot / 2) return { v, w: tot }; }
    return { v: null, w: 0 };
  };
  const out = [];
  for (const u of etf_universe) {
    const h = fund_holdings.filter((x) => x.etf === u.etf);
    const snap = new Date(u.snapshotDate);
    const fx = live[u.etf] > 0 ? live[u.etf] / u.snapshotPrice : 1;
    let W = { ey: 0, by: 0, eby: 0, fcf: 0, dy: 0, g: 0, r: 0, fpe: 0, shy: 0, fxv: 0, fxm: 0, fxall: 0, fxnon: 0, fxvn: 0 };
    let S = { ey: 0, by: 0, eby: 0, fcf: 0, dy: 0, e0: 0, e1: 0, e2: 0, en: 0, r0: 0, r1: 0, r2: 0, fpe: 0, shy: 0, fxv: 0, fxm: 0 };
    const iss = [], mt = [];
    const roe = [], roic = [], nm = [], iq = [], nd = [];
    for (const x of h) {
      const s = c[x.symbol];
      if (!s) continue;
      const w = x.weight, fin = s.sector === 'Financial Services';
      const pe = num(s.peTTM), pb = num(s.pbTTM), ev = num(s.evEbitdaTTM), ps = num(s.psTTM);
      if (pe) { W.ey += w; S.ey += w * clip(1 / pe, -0.25, 0.4); }
      if (pb > 0) { W.by += w; S.by += w * clip(1 / pb, 0, 2); }
      if (ev && !fin) { W.eby += w; S.eby += w * clip(1 / ev, -0.25, 0.5); }
      if (num(s.fcfYieldTTM) !== null && !fin) { W.fcf += w; S.fcf += w * clip(s.fcfYieldTTM, -0.2, 0.3); }
      if (num(s.divYieldTTM) !== null) { W.dy += w; S.dy += w * clip(s.divYieldTTM, 0, 0.2); }
      const eps = num(s.epsTTM), e0 = num(s.fy0Eps), e1 = num(s.fy1Eps), e2 = num(s.fy2Eps);
      if (pe > 0 && eps > 0 && e0 !== null && e1 !== null && e2 !== null && s.fy1Date) {
        const k0 = e0 / eps, k1 = e1 / eps, k2 = e2 / eps;
        const ok = [k0, k1, k2].every((k) => k > 0.2 && k < 5);
        if (ok) {
          const f = clip((new Date(s.fy1Date) - snap) / 31536e6, 0, 1);
          const ey = clip(1 / pe, 0, 0.4);
          W.g += w; S.e0 += w * ey * k0; S.e1 += w * ey * k1; S.e2 += w * ey * k2; S.en += w * ey * (f * k1 + (1 - f) * k2);
        }
      }
      const r0 = num(s.fy0Rev), r1 = num(s.fy1Rev), r2 = num(s.fy2Rev);
      if (ps > 0 && r0 > 0 && r1 > 0 && r2 > 0 && r1 / r0 > 0.3 && r1 / r0 < 3 && r2 / r0 > 0.3 && r2 / r0 < 4) {
        W.r += w; S.r0 += w / ps; S.r1 += (w / ps) * (r1 / r0); S.r2 += (w / ps) * (r2 / r0);
      }
      // forward P/E with price and consensus in the same currency (weighted harmonic), shareholder yield, dilution, margin trend, currency
      if (num(s.fwdPEc) > 0) { W.fpe += w; S.fpe += w * clip(1 / s.fwdPEc, -0.25, 0.5); }
      if (num(s.netIssuance) !== null) {
        iss.push([w, clip(s.netIssuance, -0.2, 0.3)]);
        if (num(s.divYieldTTM) !== null) { W.shy += w; S.shy += w * clip(s.divYieldTTM - s.netIssuance, -0.2, 0.25); }
      }
      if (num(s.marginTrend) !== null && !fin) mt.push([w, clip(s.marginTrend, -0.3, 0.3)]);
      if (s.fxCcy) {
        W.fxall += w; if (s.fxCcy !== 'USD') W.fxnon += w;
        const fv = FXV[s.fxCcy];
        if (fv && num(fv.value) !== null) { W.fxv += w; S.fxv += w * fv.value; if (s.fxCcy !== 'USD') W.fxvn += w; }
        if (fv && num(fv.chg12m) !== null) { W.fxm += w; S.fxm += w * fv.chg12m; }
      }
      roe.push([w, num(s.roeTTM) === null ? null : clip(s.roeTTM, -1, 1)]);
      nm.push([w, num(s.netMarginTTM) === null ? null : clip(s.netMarginTTM, -1, 1)]);
      iq.push([w, num(s.incomeQualityTTM) === null || fin ? null : clip(s.incomeQualityTTM, -2, 4)]);
      if (!fin) {
        roic.push([w, num(s.roicTTM) === null ? null : clip(s.roicTTM, -1, 1)]);
        nd.push([w, num(s.netDebtToEbitdaTTM) === null ? null : clip(s.netDebtToEbitdaTTM, -5, 10)]);
      }
    }
    const cov = (k) => W[k] / 100;
    const med = (p) => { const r = wmed(p); return r.w >= 25 ? r : { v: null, w: r.w }; };
    const mROE = med(roe), mROIC = med(roic), mNM = med(nm), mIQ = med(iq), mND = med(nd);
    const gOk = W.g >= 25;
    // forward P/E: currency-consistent consensus multiple where enough of the fund has one, else scaled from trailing P/E
    const fwdPE = S.fpe > 0 && W.fpe >= 25 ? (W.fpe / S.fpe) * fx : S.en > 0 && gOk ? (W.g / S.en) * fx : null;
    const mIss = med(iss), mMt = med(mt);
    const cagr = S.e0 > 0 && S.e2 > 0 && gOk ? Math.sqrt(S.e2 / S.e0) - 1 : null;
    out.push({
      etf: u.etf, priceFactor: fx,
      peTTM: S.ey > 0 && W.ey >= 25 ? (W.ey / S.ey) * fx : null,
      fwdPE,
      pb: S.by > 0 && W.by >= 25 ? (W.by / S.by) * fx : null,
      evEbitda: S.eby > 0 && W.eby >= 25 ? (W.eby / S.eby) * fx : null,
      fcfYield: W.fcf >= 25 ? S.fcf / W.fcf / fx : null,
      divYield: W.dy >= 25 ? S.dy / W.dy / fx : null,
      epsGrowthFy1: S.e0 > 0 && gOk ? S.e1 / S.e0 - 1 : null,
      epsGrowthFy2: S.e1 > 0 && gOk ? S.e2 / S.e1 - 1 : null,
      epsCagr2y: cagr,
      revCagr2y: S.r0 > 0 && W.r >= 25 ? Math.sqrt(S.r2 / S.r0) - 1 : null,
      peg: fwdPE && cagr > 0.02 ? fwdPE / (cagr * 100) : null,
      roe: mROE.v, roic: mROIC.v, netMargin: mNM.v, cashConversion: mIQ.v, netDebtEbitda: mND.v,
      netIssuance: mIss.v, marginTrend: mMt.v,
      shareholderYield: W.shy >= 25 ? S.shy / W.shy / fx : null,
      // a currency without a PPP estimate (Taiwan) leaves the fund unscored rather than counted as fair value
      fxValue: W.fxall >= 25 && W.fxnon >= 10 ? (W.fxvn >= 0.6 * W.fxnon ? S.fxv / W.fxall : null) : (W.fxall >= 25 ? 0 : null),
      fxMomentum: W.fxall >= 25 && W.fxnon >= 10 ? (W.fxm ? S.fxm / W.fxall : null) : null,
      fxShare: W.fxall >= 25 ? W.fxnon / W.fxall : null,
      fwdPEBasis: S.fpe > 0 && W.fpe >= 25 ? 'consensus' : 'scaled',
      coverageValuation: cov('ey'), coverageGrowth: cov('g'), coverageQuality: mROE.w / 100,
    });
  }
  return out;
},
});
dash.calc('sentiment_metrics', {
  inputs: ['fund_holdings', 'constituents', 'constituent_quotes'],
  title: 'Look-through sentiment',
  description: 'Weighted analyst ratings, target upside, estimate dispersion and breadth, estimate revisions and rating drift, and the share of holdings above their moving averages.',
  fn: (fund_holdings, constituents, constituent_quotes) => {
  const c = {}, q = {};
  for (const r of constituents) c[r.symbol] = r;
  for (const r of constituent_quotes) q[r.symbol] = r;
  const clip = (v, a, b) => Math.min(b, Math.max(a, v));
  const acc = {};
  for (const x of fund_holdings) {
    const a = (acc[x.etf] = acc[x.etf] || { etf: x.etf, wb: 0, b: 0, wu: 0, u: 0, wd: [], wbr: 0, br: 0, w2: 0, a200: 0, a50: 0, hi: 0, w4: 0, r4: 0, up4: 0, dn4: 0, w13: 0, r13: 0, wrd: 0, rd: 0 });
    const s = c[x.symbol], k = q[x.symbol], w = x.weight;
    if (!s) continue;
    const g = [s.gradesStrongBuy, s.gradesBuy, s.gradesHold, s.gradesSell, s.gradesStrongSell].map((v) => Number(v) || 0);
    const tot = g.reduce((t, v) => t + v, 0);
    if (tot >= 3) { a.wb += w; a.b += (w * (g[0] + g[1])) / tot; }
    const px = k && Number(k.price) > 0 ? Number(k.price) : Number(s.price);
    if (Number(s.targetConsensus) > 0 && px > 0) { a.wu += w; a.u += w * clip(s.targetConsensus / px - 1, -0.5, 1); }
    if (Number(s.fy1Eps) && s.fy1EpsHigh !== null && s.fy1EpsLow !== null) a.wd.push([w, clip((s.fy1EpsHigh - s.fy1EpsLow) / Math.abs(s.fy1Eps), 0, 3)]);
    if (s.fy1Eps !== null && s.fy2Eps !== null) { a.wbr += w; a.br += s.fy2Eps > s.fy1Eps ? w : 0; }
    const ok = (v) => v !== null && v !== undefined && v !== '' && isFinite(Number(v));
    if (ok(s.epsRev4w)) { const r = clip(Number(s.epsRev4w), -0.5, 0.5); a.w4 += w; a.r4 += w * r; a.up4 += r > 0.0025 ? w : 0; a.dn4 += r < -0.0025 ? w : 0; }
    if (ok(s.epsRev13w)) { a.w13 += w; a.r13 += w * clip(Number(s.epsRev13w), -0.5, 0.5); }
    if (ok(s.ratingDrift3m)) { a.wrd += w; a.rd += w * clip(Number(s.ratingDrift3m), -0.5, 0.5); }
    if (k && Number(k.priceAvg200) > 0 && Number(k.price) > 0) {
      a.w2 += w;
      a.a200 += Number(k.price) > Number(k.priceAvg200) ? w : 0;
      a.a50 += Number(k.price) > Number(k.priceAvg50) ? w : 0;
      a.hi += Number(k.yearHigh) > 0 && Number(k.price) >= 0.95 * Number(k.yearHigh) ? w : 0;
    }
  }
  return Object.values(acc).map((a) => {
    const s = a.wd.sort((x, y) => x[1] - y[1]);
    const tot = s.reduce((t, x) => t + x[0], 0);
    let m = null, run = 0;
    for (const [w, v] of s) { run += w; if (run >= tot / 2) { m = v; break; } }
    return {
      etf: a.etf,
      buyShare: a.wb >= 25 ? a.b / a.wb : null,
      targetUpside: a.wu >= 25 ? a.u / a.wu : null,
      estimateDispersion: tot >= 25 ? m : null,
      estimateBreadth: a.wbr >= 25 ? a.br / a.wbr : null,
      above200d: a.w2 >= 25 ? a.a200 / a.w2 : null,
      above50d: a.w2 >= 25 ? a.a50 / a.w2 : null,
      near52wHigh: a.w2 >= 25 ? a.hi / a.w2 : null,
      epsRevision4w: a.w4 >= 25 ? a.r4 / a.w4 : null,
      epsRevision13w: a.w13 >= 25 ? a.r13 / a.w13 : null,
      revisionBreadth4w: a.w4 >= 25 ? (a.up4 - a.dn4) / a.w4 : null,
      ratingDrift3m: a.wrd >= 25 ? a.rd / a.wrd : null,
      coverageAnalyst: a.wb / 100, coverageTargets: a.wu / 100,
    };
  });
},
});
dash.calc('scores', {
  inputs: ['etf_universe', 'fund_metrics', 'tech_metrics', 'sentiment_metrics', 'etf_quotes', 'val_history', 'etf_extras'],
  title: 'Four-pillar scores',
  description: 'Percentile rank of every metric across the universe, averaged into quality, growth, valuation, technicals and sentiment, then a composite for each weight preset and sentiment reading, with overall and in-group ranks. Valuation is also measured within category (the default), against each sleeve\u2019s own history, and as a blend.',
  fn: (etf_universe, fund_metrics, tech_metrics, sentiment_metrics, etf_quotes, val_history, etf_extras) => {
  const X = {};
  for (const r of etf_extras || []) X[r.etf] = r;
  const F = {}, T = {}, S = {}, Q = {};
  for (const q of etf_quotes) Q[q.symbol] = { livePrice: Number(q.price), dayChange: Number(q.changePercentage) / 100 };
  for (const r of fund_metrics) F[r.etf] = r;
  for (const r of tech_metrics) T[r.etf] = r;
  for (const r of sentiment_metrics) S[r.etf] = r;
  const spec = {
    quality: [['roe', 1], ['roic', 1], ['netMargin', 1], ['cashConversion', 1], ['netDebtEbitda', -1], ['estimateDispersion', -1], ['netIssuance', -1]],
    // epsRevision13w is blank until 13 weeks of weekly estimate snapshots exist; until then it simply drops out of the average
    growth: [['epsGrowthFy1', 1], ['epsGrowthFy2', 1], ['epsCagr2y', 1], ['revCagr2y', 1], ['estimateBreadth', 1], ['epsRevision13w', 1]],
    valuation: [['fwdPE', -1], ['peTTM', -1], ['capePE', -1], ['evEbitda', -1], ['pb', -1], ['fcfYield', 1], ['divYield', 1], ['peg', -1], ['shareholderYield', 1], ['fxValue', 1]],
    technicals: [['mom12_1', 1], ['ret6m', 1], ['vs200d', 1], ['sma50vs200', 1], ['drawdown52w', 1], ['vol3m', -1]],
    // Sentiment is scored contrarian: crowded, optimistic positioning ranks lower. The confirming read is 100 minus this.
    // positioning, read contrarian: analyst optimism and recent fund inflows score lower. Price breadth moved out (see Methodology)
    sentiment: [['buyShare', -1], ['targetUpside', -1], ['flow6m', -1]],
  };
  // cycle-adjusted P/E: today's price over the sleeve's average trailing earnings of the last five years (rebuilt monthly history)
  const E5 = {};
  for (const h of val_history || []) if (h.metric === 'earn5y' && Number(h.last) > 0) E5[h.etf] = Number(h.last);
  const rows = etf_universe.map((u) => {
    const r = { ...u, ...F[u.etf], ...T[u.etf], ...S[u.etf], ...Q[u.etf], ...(X[u.etf] || {}) };
    r.capePE = E5[u.etf] && r.livePrice > 0 ? r.livePrice / E5[u.etf] : null;
    return r;
  });
  const pct = {};
  for (const metrics of Object.values(spec)) {
    for (const [m, dir] of metrics) {
      const vals = rows.filter((r) => r[m] !== null && r[m] !== undefined && isFinite(r[m]));
      const sorted = vals.map((r) => dir * r[m]).sort((a, b) => a - b);
      for (const r of vals) {
        const v = dir * r[m];
        const lo = sorted.filter((x) => x < v).length, eq = sorted.filter((x) => x === v).length;
        (pct[r.etf] = pct[r.etf] || {})[m] = (100 * (lo + eq / 2)) / sorted.length;
      }
    }
  }
  const avg = (a) => { const v = a.filter((x) => x !== null && x !== undefined); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
  // Valuation five ways. Cycle-adjusted own history (the default): where the five-year-average-earnings P/E sits in the sleeve's own record. Within category: each multiple ranked only against sleeves in the same group. Own history: where today's multiple sits in the sleeve's own monthly record since 2015 (cheap = high).
  // Within category: rank among sleeves of the same group. Blend: the average of the three. Each is re-ranked across the universe.
  const VH = {};
  for (const h of val_history || []) (VH[h.etf] = VH[h.etf] || {})[h.metric] = h;
  const histPos = (etf, m, v) => {
    const h = VH[etf] && VH[etf][m];
    if (!h || v === null || v === undefined || !isFinite(v)) return null;
    const q = []; for (let i = 0; i <= 20; i++) q.push(Number(h['q' + i]));
    if (v <= q[0]) return 0;
    if (v >= q[20]) return 100;
    let i = 0; while (i < 19 && q[i + 1] < v) i++;
    const span = q[i + 1] - q[i];
    return 5 * (i + (span > 0 ? (v - q[i]) / span : 0.5));
  };
  const OWN = [['peTTM', -1], ['capePE', -1], ['evEbitda', -1], ['pb', -1], ['fcfYield', 1], ['divYield', 1]];
  const xsRank = (getter) => {
    const vals = rows.map((r) => [r.etf, getter(r)]).filter(([, v]) => v !== null && v !== undefined && isFinite(v));
    const sorted = vals.map(([, v]) => v).sort((a, b) => a - b), res = {};
    for (const [e, v] of vals) res[e] = (100 * (sorted.filter((x) => x < v).length + sorted.filter((x) => x === v).length / 2)) / sorted.length;
    return res;
  };
  const histOf = {}, ownRaw = {}, grpRaw = {}, gpct = {};
  for (const r of rows) {
    const hp = {}, sc = [];
    for (const [m, dir] of OWN) { const p = histPos(r.etf, m, r[m]); hp[m] = p; if (p !== null) sc.push(dir > 0 ? p : 100 - p); }
    histOf[r.etf] = hp;
    ownRaw[r.etf] = sc.length >= 2 ? sc.reduce((a, b) => a + b, 0) / sc.length : null;
    const g = [];
    for (const [m, dir] of spec.valuation) {
      const peers = rows.filter((x) => x.group === r.group && x[m] !== null && x[m] !== undefined && isFinite(x[m]));
      if (peers.length < 3 || r[m] === null || r[m] === undefined || !isFinite(r[m])) continue;
      const v = dir * r[m], arr = peers.map((x) => dir * x[m]);
      const gp = (100 * (arr.filter((x) => x < v).length + arr.filter((x) => x === v).length / 2)) / arr.length;
      (gpct[r.etf] = gpct[r.etf] || {})[m] = gp; g.push(gp);
    }
    grpRaw[r.etf] = g.length ? g.reduce((a, b) => a + b, 0) / g.length : null;
  }
  const valOwn = xsRank((r) => ownRaw[r.etf]), valGrp = xsRank((r) => grpRaw[r.etf]);
  const valCape = xsRank((r) => { const p = histOf[r.etf].capePE; return p === null || p === undefined ? null : 100 - p; });
  const valXs = {};
  for (const r of rows) { const p = pct[r.etf] || {}; valXs[r.etf] = avg(spec.valuation.map(([m]) => p[m])); }
  const valBlend = xsRank((r) => { const v = [valXs[r.etf], valOwn[r.etf], valGrp[r.etf]].filter((x) => x !== null && x !== undefined); return v.length === 3 ? v.reduce((a, b) => a + b, 0) / 3 : null; });
  // Pillar weights for each preset: fundamentals, valuation, technicals, sentiment.
  const presets = { equal: [0.25, 0.25, 0.25, 0.25], value: [0.3, 0.4, 0.15, 0.15], momentum: [0.15, 0.15, 0.5, 0.2], quality: [0.45, 0.25, 0.15, 0.15], contrarian: [0.2, 0.35, 0.1, 0.35], long: [0.3, 0.35, 0.2, 0.15], evidence: [0.5, 0.1, 0.2, 0.2] };
  const wavg = (vals, w) => { let s = 0, d = 0; vals.forEach((v, i) => { if (v !== null && v !== undefined) { s += v * w[i]; d += w[i]; } }); return d ? s / d : null; };
  const scored = rows.map((r) => {
    const p = pct[r.etf] || {};
    const pill = {};
    for (const [k, metrics] of Object.entries(spec)) pill[k] = avg(metrics.map(([m]) => p[m]));
    const fundamentals = avg([pill.quality, pill.growth]);
    const sentimentConfirming = pill.sentiment === null ? null : 100 - pill.sentiment;
    const vo = valCape[r.etf] ?? null;
    // the default valuation is the cycle-adjusted P/E against the sleeve's own record (the one method with a positive backtest); the page can switch basis
    const out = { ...r, fundamentals, quality: pill.quality, growth: pill.growth, valuation: vo, valuation_own: valOwn[r.etf] ?? null, valuation_xs: valXs[r.etf] ?? null, valuation_grp: valGrp[r.etf] ?? null, valuation_blend: valBlend[r.etf] ?? null, valuation_cape: valCape[r.etf] ?? null, technicals: pill.technicals, sentiment: pill.sentiment, sentimentConfirming };
    for (const [m, dir] of OWN) { const hp = histOf[r.etf][m]; out['hist_' + m] = hp; out['own_' + m] = hp === null ? null : dir > 0 ? hp : 100 - hp; out['histMed_' + m] = VH[r.etf] && VH[r.etf][m] ? Number(VH[r.etf][m].q10) : null; }
    out.histStart = VH[r.etf] && VH[r.etf].peTTM ? VH[r.etf].peTTM.start : null;
    out.hist_netMargin = histPos(r.etf, 'netMargin', r.netMargin);
    for (const [m, v] of Object.entries(gpct[r.etf] || {})) out['gpct_' + m] = v;
    for (const [name, w] of Object.entries(presets)) {
      out['cmp_' + name + '_contra'] = wavg([fundamentals, vo, pill.technicals, pill.sentiment], w);
      out['cmp_' + name + '_confirm'] = wavg([fundamentals, vo, pill.technicals, sentimentConfirming], w);
    }
    out.composite = out.cmp_equal_contra;
    out.compositeConfirming = out.cmp_equal_confirm;
    for (const [m, v] of Object.entries(p)) out['pct_' + m] = v;
    return out;
  });
  const keys = Object.keys(presets).flatMap((n) => ['cmp_' + n + '_contra', 'cmp_' + n + '_confirm']);
  return scored.map((r) => {
    const out = { ...r };
    for (const k of keys) {
      const peers = scored.filter((x) => x.group === r.group && x[k] !== null);
      out['rank' + k.slice(3)] = r[k] === null ? null : scored.filter((x) => x[k] > r[k]).length + 1;
      out['grp' + k.slice(3)] = r[k] === null ? null : peers.filter((x) => x[k] > r[k]).length + 1;
    }
    out.groupRank = out.grp_equal_contra;
    out.groupRankConfirming = out.grp_equal_confirm;
    out.groupSize = scored.filter((x) => x.group === r.group && x.composite !== null).length;
    return out;
  });
},
});
dash.calc('breakdown', {
  inputs: ['scores'],
  title: 'Score drivers',
  description: 'Each metric behind each pillar, with its universe median and the sleeve’s percentile rank.',
  fn: (scores) => {
  const spec = [
    ['quality', 'roe', 'Return on equity', 'pct', 1], ['quality', 'roic', 'Return on invested capital', 'pct', 1], ['quality', 'netMargin', 'Net margin', 'pct', 1],
    ['quality', 'cashConversion', 'Cash conversion (OCF ÷ net income)', 'x', 1], ['quality', 'netDebtEbitda', 'Net debt ÷ EBITDA', 'x', -1],
    ['quality', 'estimateDispersion', 'Earnings visibility (estimate dispersion)', 'pct', -1], ['quality', 'netIssuance', 'Net share issuance, 1 year', 'pct', -1],
    ['growth', 'epsGrowthFy1', 'EPS growth, current fiscal year', 'pct', 1], ['growth', 'epsGrowthFy2', 'EPS growth, next fiscal year', 'pct', 1],
    ['growth', 'epsCagr2y', 'EPS growth, 2-year annualized', 'pct', 1], ['growth', 'revCagr2y', 'Revenue growth, 2-year annualized', 'pct', 1],
    ['growth', 'estimateBreadth', 'Growth breadth (holdings with rising EPS)', 'pct', 1], ['growth', 'epsRevision13w', 'EPS estimate revision, 13 weeks', 'pct', 1],
    ['valuation', 'fwdPE', 'Forward P/E (next 12 months)', 'x', -1], ['valuation', 'peTTM', 'Trailing P/E', 'x', -1], ['valuation', 'capePE', 'Cycle-adjusted P/E (5-year average earnings)', 'x', -1], ['valuation', 'evEbitda', 'EV ÷ EBITDA', 'x', -1],
    ['valuation', 'pb', 'Price ÷ book', 'x', -1], ['valuation', 'fcfYield', 'Free cash flow yield', 'pct', 1], ['valuation', 'divYield', 'Dividend yield', 'pct', 1],
    ['valuation', 'peg', 'PEG (forward P/E ÷ 2-year EPS growth)', 'x', -1], ['valuation', 'shareholderYield', 'Shareholder yield (dividends plus net buybacks)', 'pct', 1], ['valuation', 'fxValue', 'Currency valuation (PPP, peer-adjusted)', 'num', 1],
    ['technicals', 'mom12_1', '12-month momentum, skip last month', 'pct', 1], ['technicals', 'ret6m', '6-month return', 'pct', 1],
    ['technicals', 'vs200d', 'Price vs 200-day average', 'pct', 1], ['technicals', 'sma50vs200', '50-day vs 200-day average', 'pct', 1],
    ['technicals', 'drawdown52w', 'Distance from 52-week high', 'pct', 1], ['technicals', 'vol3m', 'Volatility, 3-month annualized', 'pct', -1],
    ['sentiment', 'buyShare', 'Analyst buy ratings', 'pct', -1], ['sentiment', 'targetUpside', 'Upside to consensus price target', 'pct', -1],
    ['sentiment', 'flow6m', 'Fund flows, 6 months (share-count growth)', 'pct', -1],
  ];
  const out = [];
  for (const [pillar, metric, label, unit, direction] of spec) {
    const vals = scores.map((r) => r[metric]).filter((v) => v !== null && v !== undefined && isFinite(v)).sort((a, b) => a - b);
    const n = vals.length;
    const median = n ? (n % 2 ? vals[(n - 1) / 2] : (vals[n / 2 - 1] + vals[n / 2]) / 2) : null;
    for (const r of scores) {
      const v = r[metric];
      out.push({ etf: r.etf, pillar, metric, label, unit, direction, value: v === undefined || (v !== null && !isFinite(v)) ? null : v, median, ownScore: r['own_' + metric] ?? null, grpScore: r['gpct_' + metric] ?? null, ownMedian: r['histMed_' + metric] ?? null, histPct: r['hist_' + metric] ?? null, rankScore: r['pct_' + metric] ?? null, rankScoreConfirming: r['pct_' + metric] === undefined || r['pct_' + metric] === null ? null : pillar === 'sentiment' ? 100 - r['pct_' + metric] : r['pct_' + metric] });
    }
  }
  return out;
},
});
dash.calc('holding_view', {
  inputs: ['fund_holdings', 'constituents', 'constituent_quotes'],
  title: 'Top-ten holdings',
  description: 'Each fund’s ten largest holdings with live price, forward P/E, next-year EPS growth, trend and target upside.',
  fn: (fund_holdings, constituents, constituent_quotes) => {
  const c = {}, q = {};
  for (const r of constituents) c[r.symbol] = r;
  for (const r of constituent_quotes) q[r.symbol] = r;
  return fund_holdings.filter((h) => h.rank <= 10).map((h) => {
    const s = c[h.symbol] || {}, k = q[h.symbol] || {};
    const px = Number(k.price) > 0 ? Number(k.price) : null;
    const move = px && Number(s.price) > 0 ? px / s.price : 1;
    const eps = Number(s.epsTTM), e1 = Number(s.fy1Eps), e2 = Number(s.fy2Eps), pe = Number(s.peTTM);
    let fwdPE = null;
    if (pe > 0 && eps > 0 && e1 > 0 && e2 > 0 && s.fy1Date) {
      const f = Math.min(1, Math.max(0, (new Date(s.fy1Date) - Date.now()) / 31536e6));
      const k2 = (f * e1 + (1 - f) * e2) / eps;
      if (k2 > 0.2 && k2 < 5) fwdPE = (pe * move) / k2;
    }
    return {
      etf: h.etf, symbol: h.symbol, name: s.name || h.name, sector: s.sector || null, weight: h.weight / 100, rank: h.rank,
      price: px, dayChange: Number(k.changePercentage) / 100 || null,
      fwdPE,
      epsGrowthFy2: e1 > 0 && e2 ? e2 / e1 - 1 : null,
      vs200d: px && Number(k.priceAvg200) > 0 ? px / k.priceAvg200 - 1 : null,
      targetUpside: px && Number(s.targetConsensus) > 0 ? s.targetConsensus / px - 1 : null,
    };
  });
},
});
dash.calc('price_lines', {
  inputs: ['etf_history'],
  title: 'Price and moving averages',
  description: 'Dividend-adjusted close with 50- and 200-day simple moving averages for each ETF.',
  fn: (etf_history) => {
  const by = {};
  for (const r of etf_history) (by[r.symbol] = by[r.symbol] || []).push({ symbol: r.symbol, date: String(r.date).slice(0, 10), close: Number(r.adjClose) });
  const out = [];
  for (const s of Object.values(by)) {
    s.sort((a, b) => (a.date < b.date ? -1 : 1));
    let a50 = 0, a200 = 0;
    s.forEach((r, i) => {
      a50 += r.close - (i >= 50 ? s[i - 50].close : 0);
      a200 += r.close - (i >= 200 ? s[i - 200].close : 0);
      out.push({ ...r, sma50: i >= 49 ? a50 / 50 : null, sma200: i >= 199 ? a200 / 200 : null });
    });
  }
  return out;
},
});

dash.loader('acwi_countries', {
  description: 'Turns FMP’s country weights for ACWI into rows of country and weight (as a fraction).',
  fn: ({ answer }) => {
    const rows = parseRows(answer);
    if (!rows.length) throw new Error('FMP returned no country weights for ACWI');
    return rows.map((r) => ({ country: r.country, weight: Number(String(r.weightPercentage).replace('%', '')) / 100 }));
  },
});
dash.calc('monthly', {
  inputs: ['etf_history'],
  title: 'Month-end prices',
  description: 'Last dividend-adjusted close of each month for every ETF, including the current month to date.',
  fn: (etf_history) => {
  const last = {};
  for (const r of etf_history) {
    const d = String(r.date).slice(0, 10), k = r.symbol + '|' + d.slice(0, 7);
    if (!last[k] || last[k].date < d) last[k] = { symbol: r.symbol, month: d.slice(0, 7), date: d, close: Number(r.adjClose) };
  }
  return Object.values(last).sort((a, b) => (a.symbol < b.symbol ? -1 : a.symbol > b.symbol ? 1 : a.month < b.month ? -1 : 1));
},
});
dash.calc('correlations', {
  inputs: ['monthly'],
  title: 'Return correlations, 36 months',
  description: 'Correlation of monthly returns between every pair of ETFs over the latest 36 months.',
  fn: (monthly) => {
  const by = {};
  for (const r of monthly) (by[r.symbol] = by[r.symbol] || []).push(r);
  const ret = {};
  for (const [s, rows] of Object.entries(by)) {
    rows.sort((a, b) => (a.month < b.month ? -1 : 1));
    const tail = rows.slice(-37);
    ret[s] = {};
    for (let i = 1; i < tail.length; i++) ret[s][tail[i].month] = tail[i].close / tail[i - 1].close - 1;
  }
  const syms = Object.keys(ret), out = [];
  for (const a of syms) for (const b of syms) {
    const ms = Object.keys(ret[a]).filter((m) => m in ret[b]);
    const n = ms.length;
    if (n < 12) { out.push({ a, b, corr: null, months: n }); continue; }
    const x = ms.map((m) => ret[a][m]), y = ms.map((m) => ret[b][m]);
    const mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
    out.push({ a, b, corr: sxx && syy ? sxy / Math.sqrt(sxx * syy) : null, months: n });
  }
  return out;
},
});
dash.calc('relations', {
  inputs: ['scores'],
  title: 'Metric relationships',
  description: 'Across the sleeves, the correlation, R² and regression line between every pair of metrics and pillar scores.',
  fn: (scores) => {
  const fam = {
    quality: ['roe', 'roic', 'netMargin', 'cashConversion', 'netDebtEbitda', 'estimateDispersion', 'netIssuance'],
    growth: ['epsGrowthFy1', 'epsGrowthFy2', 'epsCagr2y', 'revCagr2y', 'estimateBreadth', 'marginTrend'],
    valuation: ['fwdPE', 'peTTM', 'capePE', 'evEbitda', 'pb', 'fcfYield', 'divYield', 'peg', 'shareholderYield', 'fxValue'],
    technicals: ['mom12_1', 'ret6m', 'vs200d', 'sma50vs200', 'drawdown52w', 'vol3m'],
    sentiment: ['buyShare', 'targetUpside', 'flow6m'],
    pillar: ['fundamentals', 'valuation', 'technicals', 'sentiment'],
  };
  const list = Object.entries(fam).flatMap(([f, ms]) => ms.map((m) => [m, f]));
  const out = [];
  for (const [x, fx] of list) for (const [y, fy] of list) {
    if (x === y) continue;
    const pts = scores.filter((r) => r[x] !== null && r[x] !== undefined && isFinite(r[x]) && r[y] !== null && r[y] !== undefined && isFinite(r[y]));
    const n = pts.length;
    if (n < 8) continue;
    const mx = pts.reduce((s, r) => s + r[x], 0) / n, my = pts.reduce((s, r) => s + r[y], 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (const r of pts) { sxy += (r[x] - mx) * (r[y] - my); sxx += (r[x] - mx) ** 2; syy += (r[y] - my) ** 2; }
    if (!sxx || !syy) continue;
    const corr = sxy / Math.sqrt(sxx * syy), slope = sxy / sxx;
    out.push({ pair: x + '|' + y, x, y, xFamily: fx, yFamily: fy, n, corr, r2: corr * corr, slope, intercept: my - slope * mx });
  }
  return out;
},
});

dash.calc('breadth', {
  inputs: ['fund_holdings', 'constituent_quotes'],
  title: 'Holdings breadth',
  description: 'For each ETF, the weighted share of its look-through holdings above their 50- and 200-day averages, near 52-week highs or lows, and up or down today.',
  fn: (fund_holdings, constituent_quotes) => {
  const q = {};
  for (const r of constituent_quotes) q[r.symbol] = r;
  const acc = {};
  for (const h of fund_holdings) {
    const k = q[h.symbol];
    const a = (acc[h.etf] = acc[h.etf] || { etf: h.etf, w: 0, n: 0, a50: 0, a200: 0, hi: 0, lo: 0, up: 0, dn: 0, nHi: 0, nLo: 0 });
    if (!k || !(Number(k.price) > 0)) continue;
    const w = h.weight, p = Number(k.price);
    a.w += w; a.n += 1;
    if (Number(k.priceAvg50) > 0 && p > k.priceAvg50) a.a50 += w;
    if (Number(k.priceAvg200) > 0 && p > k.priceAvg200) a.a200 += w;
    if (Number(k.yearHigh) > 0 && p >= 0.95 * k.yearHigh) { a.hi += w; a.nHi += 1; }
    if (Number(k.yearLow) > 0 && p <= 1.05 * k.yearLow) { a.lo += w; a.nLo += 1; }
    if (Number(k.changePercentage) > 0) a.up += w;
    if (Number(k.changePercentage) < 0) a.dn += w;
  }
  return Object.values(acc).map((a) => ({
    etf: a.etf, namesWithQuotes: a.n, weightCovered: a.w / 100,
    above50d: a.w ? a.a50 / a.w : null, above200d: a.w ? a.a200 / a.w : null,
    nearHigh: a.w ? a.hi / a.w : null, nearLow: a.w ? a.lo / a.w : null,
    netHighLow: a.w ? (a.hi - a.lo) / a.w : null,
    upToday: a.w ? a.up / a.w : null, downToday: a.w ? a.dn / a.w : null,
    namesNearHigh: a.nHi, namesNearLow: a.nLo,
  }));
},
});
dash.calc('concentration', {
  inputs: ['etf_universe', 'fund_holdings', 'constituents'],
  title: 'Concentration',
  description: 'Largest holdings, top-10 weight, effective number of holdings, and the largest sector and country in each ETF’s look-through.',
  fn: (etf_universe, fund_holdings, constituents) => {
  const c = {};
  for (const r of constituents) c[r.symbol] = r;
  return etf_universe.map((u) => {
    const h = fund_holdings.filter((x) => x.etf === u.etf).sort((a, b) => b.weight - a.weight);
    const w = h.map((x) => x.weight / 100);
    const listed = w.reduce((s, v) => s + v, 0);
    const rest = Math.max(0, 1 - listed), restN = Math.max(0, u.holdingsCount - h.length);
    const hhi = w.reduce((s, v) => s + v * v, 0) + (restN ? (rest * rest) / restN : 0);
    const sec = {}, ctry = {};
    let cov = 0;
    for (const x of h) {
      const s = c[x.symbol];
      if (!s) continue;
      cov += x.weight;
      sec[s.sector || 'Other'] = (sec[s.sector || 'Other'] || 0) + x.weight;
      ctry[s.country || 'Other'] = (ctry[s.country || 'Other'] || 0) + x.weight;
    }
    const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1])[0] || [null, 0];
    const [ts, tsw] = top(sec), [tc, tcw] = top(ctry);
    const secHhi = Object.values(sec).reduce((s, v) => s + (v / cov) ** 2, 0);
    return {
      etf: u.etf, holdingsCount: u.holdingsCount,
      topHolding: h[0] ? h[0].name : null, topWeight: w[0] ?? null,
      top5Weight: w.slice(0, 5).reduce((s, v) => s + v, 0), top10Weight: w.slice(0, 10).reduce((s, v) => s + v, 0),
      effectiveHoldings: hhi ? 1 / hhi : null,
      topSector: ts, topSectorWeight: cov ? tsw / cov : null, effectiveSectors: secHhi ? 1 / secHhi : null,
      topCountry: tc, topCountryWeight: cov ? tcw / cov : null,
    };
  });
},
});
dash.calc('sector_exposure', {
  inputs: ['fund_holdings', 'constituents'],
  title: 'Sector exposure',
  description: 'Look-through sector weights for each ETF, as a share of the holdings covered.',
  fn: (fund_holdings, constituents) => {
  const c = {};
  for (const r of constituents) c[r.symbol] = r;
  const acc = {}, tot = {};
  for (const h of fund_holdings) {
    const s = c[h.symbol];
    if (!s) continue;
    const k = h.etf + '|' + (s.sector || 'Other');
    acc[k] = (acc[k] || 0) + h.weight;
    tot[h.etf] = (tot[h.etf] || 0) + h.weight;
  }
  return Object.entries(acc).map(([k, v]) => { const [etf, sector] = k.split('|'); return { etf, sector, weight: v / tot[etf] }; });
},
});
dash.calc('group_series', {
  inputs: ['sleeve_series', 'etf_universe'],
  title: 'Category time series',
  description: 'Each month, the median multiple, metric and score across the sleeves in each group and region, and an equal-weight price index of them.',
  fn: (sleeve_series, etf_universe) => {
  const meta = {};
  for (const u of etf_universe) meta[u.etf] = u;
  const metrics = ['peTTM', 'pb', 'evEbitda', 'fcfYield', 'divYield', 'roe', 'netMargin', 'above200d', 'near52wHigh', 'composite', 'quality', 'valuation', 'technicals', 'sentiment'];
  const by = {};
  for (const r of sleeve_series) {
    const u = meta[r.etf];
    if (!u) continue;
    for (const cat of ['group:' + u.group, 'region:' + u.region, 'all:All sleeves']) (by[cat + '|' + r.month] = by[cat + '|' + r.month] || []).push(r);
  }
  const prev = {};
  for (const r of sleeve_series) (prev[r.etf] = prev[r.etf] || []).push(r);
  const ret = {};
  for (const [e, rs] of Object.entries(prev)) {
    rs.sort((a, b) => (a.month < b.month ? -1 : 1));
    for (let i = 1; i < rs.length; i++) ret[e + '|' + rs[i].month] = rs[i].price / rs[i - 1].price - 1;
  }
  const median = (v) => { const s = v.filter((x) => x !== undefined && x !== null && isFinite(x)).sort((a, b) => a - b); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
  const out = [], level = {};
  for (const key of Object.keys(by).sort((a, b) => (a.split('|')[1] < b.split('|')[1] ? -1 : 1))) {
    const [cat, month] = key.split('|');
    const [kind, name] = [cat.slice(0, cat.indexOf(':')), cat.slice(cat.indexOf(':') + 1)];
    const rs = by[key];
    const rets = rs.map((r) => ret[r.etf + '|' + month]).filter((x) => x !== undefined && isFinite(x));
    level[cat] = (level[cat] || 100) * (1 + (rets.length ? rets.reduce((s, x) => s + x, 0) / rets.length : 0));
    const row = { category: name, kind, month, members: rs.length, price: level[cat] };
    for (const m of metrics) row[m] = median(rs.map((r) => r[m]));
    out.push(row);
  }
  return out;
},
});
dash.calc('long_returns', {
  inputs: ['etf_weekly', 'etf_quotes'],
  title: 'Long-run returns',
  description: 'Annualized total returns over 1 to 20 years, volatility, and drawdowns from weekly dividend-adjusted closes, ending at today’s live price.',
  fn: (etf_weekly, etf_quotes) => {
  const live = {};
  for (const q of etf_quotes) live[q.symbol] = Number(q.price);
  const by = {};
  for (const r of etf_weekly) (by[r.symbol] = by[r.symbol] || []).push(r);
  const out = [];
  for (const [s, rs] of Object.entries(by)) {
    rs.sort((a, b) => (a.date < b.date ? -1 : 1));
    const last = live[s] > 0 ? live[s] : rs[rs.length - 1].close;
    const lastDate = new Date(rs[rs.length - 1].date);
    const at = (years) => {
      const t = new Date(lastDate); t.setFullYear(t.getFullYear() - years);
      if (new Date(rs[0].date) > new Date(t.getTime() + 21 * 864e5)) return null;
      let v = null;
      for (const r of rs) { if (new Date(r.date) <= t) v = r.close; else break; }
      return v;
    };
    const ann = (y) => { const v = at(y); return v ? (last / v) ** (1 / y) - 1 : null; };
    let peak = 0, dd = 0;
    for (const r of rs) { peak = Math.max(peak, r.close); dd = Math.min(dd, r.close / peak - 1); }
    const t10 = rs.slice(-520), lr = [];
    for (let i = 1; i < t10.length; i++) lr.push(Math.log(t10[i].close / t10[i - 1].close));
    const m = lr.reduce((a, b) => a + b, 0) / (lr.length || 1);
    const vol = lr.length > 10 ? Math.sqrt(lr.reduce((a, b) => a + (b - m) ** 2, 0) / (lr.length - 1)) * Math.sqrt(52) : null;
    const first = new Date(rs[0].date), yrs = (lastDate - first) / 31557600000;
    out.push({ etf: s, historyStart: rs[0].date, ret1y: ann(1), ann3y: ann(3), ann5y: ann(5), ann10y: ann(10), ann15y: ann(15), ann20y: ann(20), annSinceStart: yrs > 1 ? (last / rs[0].close) ** (1 / yrs) - 1 : null, vol10y: vol, maxDrawdown: dd, currentDrawdown: last / Math.max(peak, last) - 1 });
  }
  return out;
},
});
dash.calc('calendar_returns', {
  inputs: ['etf_weekly', 'etf_quotes'],
  title: 'Calendar-year returns',
  description: 'Total return in each calendar year from year-end weekly closes; the current year runs to today’s live price.',
  fn: (etf_weekly, etf_quotes) => {
  const live = {};
  for (const q of etf_quotes) live[q.symbol] = Number(q.price);
  const yearEnd = {};
  for (const r of etf_weekly) {
    const k = r.symbol + '|' + r.date.slice(0, 4);
    if (!yearEnd[k] || yearEnd[k].date < r.date) yearEnd[k] = r;
  }
  const out = [];
  const syms = [...new Set(etf_weekly.map((r) => r.symbol))];
  for (const s of syms) {
    const years = Object.keys(yearEnd).filter((k) => k.startsWith(s + '|')).map((k) => Number(k.split('|')[1])).sort();
    for (const y of years) {
      const prev = yearEnd[s + '|' + (y - 1)];
      if (!prev) continue;
      const isLast = y === years[years.length - 1];
      const end = isLast && live[s] > 0 ? live[s] : yearEnd[s + '|' + y].close;
      out.push({ etf: s, year: y, ret: end / prev.close - 1, partial: isLast });
    }
  }
  return out;
},
});

dash.loader('macro_px', {
  description: 'Runs the same price-history call for the dollar, credit, Treasury, oil, gold and volatility proxies, a few at a time, and keeps symbol, date and close (dividend-adjusted where FMP has it).',
  fn: async ({ answer, call, args }) => {
    const pick = (r) => ({ symbol: r.symbol, date: String(r.date).slice(0, 10), close: Number(r.adjClose ?? r.price ?? r.close) });
    const first = parseRows(answer);
    if (!first.length) throw new Error('FMP returned no price history for ' + args.symbol);
    const rest = await fetchAll(call, 'chart', ['HYG', 'IEF', 'USO', 'GLD', '^VIX'].map((symbol) => ({ ...args, symbol, endpoint: symbol.startsWith('^') ? 'historical-price-eod-light' : args.endpoint })), (a) => parseRows(a));
    return [...first, ...rest].map(pick).filter((r) => r.symbol && isFinite(r.close));
  },
});
dash.loader('treasury', {
  description: 'FMP returns about three months of Treasury yields per call, so this asks for five consecutive windows ending today and keeps every maturity from one month to 30 years.',
  fn: async ({ answer, call, args }) => {
    const iso = (t) => new Date(t).toISOString().slice(0, 10);
    const now = Date.now(), wins = [];
    for (let i = 0; i < 5; i++) wins.push({ ...args, from_date: iso(now - (i + 1) * 88 * 864e5 + 864e5), to_date: iso(now - i * 88 * 864e5) });
    const rest = await fetchAll(call, 'economics', wins, parseRows);
    const by = {};
    const T = ['month1', 'month3', 'month6', 'year1', 'year2', 'year3', 'year5', 'year7', 'year10', 'year20', 'year30'];
    for (const r of [...parseRows(answer), ...rest]) { const o = { date: String(r.date).slice(0, 10) }; for (const k of T) o[k] = r[k] === null || r[k] === undefined ? null : Number(r[k]); by[o.date] = o; }
    return Object.values(by).sort((a, b) => (a.date < b.date ? -1 : 1));
  },
});
dash.calc('short_returns', {
  inputs: ['etf_history', 'etf_quotes'],
  title: 'Short-term returns',
  description: 'Today, week-to-date, one-week, month-to-date and one-month returns for each ETF, ending at the live price, with 200-day trend breaks, new 52-week highs and lows, and moves measured against each ETF\u2019s own daily volatility.',
  fn: (etf_history, etf_quotes) => {
  // short-horizon returns, trend breaks and unusual moves for each ETF, ending at today's live price
  const by = {};
  for (const r of etf_history) (by[r.symbol] = by[r.symbol] || []).push({ d: String(r.date).slice(0, 10), p: Number(r.adjClose) });
  const Q = {};
  for (const q of etf_quotes) Q[q.symbol] = q;
  const qDate = (q) => (q && Number(q.timestamp) > 0 ? new Date((Number(q.timestamp) - 4 * 3600) * 1000).toISOString().slice(0, 10) : null);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const out = [];
  for (const etf of Object.keys(by)) {
    const s = by[etf].filter((x) => x.p > 0).sort((a, b) => (a.d < b.d ? -1 : 1));
    if (s.length < 60) continue;
    const q = Q[etf], qd = qDate(q), qp = q ? Number(q.price) : 0;
    let live = false;
    if (qp > 0 && qd) {
      if (qd > s[s.length - 1].d) { s.push({ d: qd, p: qp }); live = true; }
      else if (qd === s[s.length - 1].d) { s[s.length - 1].p = qp; live = true; }
    }
    const n = s.length, last = s[n - 1];
    const back = (k) => (n - 1 - k >= 0 ? s[n - 1 - k].p : null);
    const before = (d) => { for (let i = n - 1; i >= 0; i--) if (s[i].d < d) return s[i].p; return null; };
    const r = (b) => (b ? last.p / b - 1 : null);
    const dt = new Date(last.d + 'T12:00:00Z');
    const mon = new Date(dt.getTime() - ((dt.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10);
    const lr = [];
    for (let i = Math.max(1, n - 63); i < n; i++) lr.push(Math.log(s[i].p / s[i - 1].p));
    const mu = avg(lr), sd = Math.sqrt(lr.reduce((x, y) => x + (y - mu) ** 2, 0) / (lr.length - 1));
    const lr21 = lr.slice(-21), mu21 = avg(lr21), sd21 = Math.sqrt(lr21.reduce((x, y) => x + (y - mu21) ** 2, 0) / (lr21.length - 1));
    const lrY = [];
    for (let i = Math.max(1, n - 252); i < n; i++) lrY.push(Math.log(s[i].p / s[i - 1].p));
    const muY = avg(lrY), sdY = Math.sqrt(lrY.reduce((x, y) => x + (y - muY) ** 2, 0) / (lrY.length - 1));
    const sma = (k, end) => (end >= k ? avg(s.slice(end - k, end).map((x) => x.p)) : null);
    const vsAt = (k, lag) => { const m = sma(k, n - lag); return m ? s[n - 1 - lag].p / m - 1 : null; };
    const vs200 = vsAt(200, 0), vs50 = vsAt(50, 0), vs200ago = vsAt(200, 10), vs200m = vsAt(200, 21);
    const yr = s.slice(Math.max(0, n - 252)).map((x) => x.p), prior = s.slice(Math.max(0, n - 252), n - 5).map((x) => x.p), recent = s.slice(n - 5).map((x) => x.p);
    const prev = n > 1 ? s[n - 2].p : null;
    const d1 = live && q && isFinite(Number(q.changePercentage)) ? Number(q.changePercentage) / 100 : r(prev);
    const w1 = r(back(5));
    const m1hist = [];
    for (let k = 0; k < 12; k++) { const a = back(21 * k), b = back(21 * (k + 1)); m1hist.push(a && b ? a / b - 1 : null); }
    const base = back(Math.min(21, n - 1));
    out.push({
      etf, asOf: last.d, live,
      d1, wtd: r(before(mon)), w1, mtd: r(before(last.d.slice(0, 8) + '01')), m1: r(back(21)), m3: r(back(63)), ytd: r(before(last.d.slice(0, 4) + '-01-01')), m12: r(back(252)),
      qtd: r(before(last.d.slice(0, 5) + String(Math.floor((Number(last.d.slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, '0') + '-01')), m6: r(back(126)),
      y2: n > 504 ? Math.pow(last.p / back(504), 0.5) - 1 : null,
      vs50, vs200, vs200ago, vs200m,
      cross200: vs200 !== null && vs200ago !== null && Math.sign(vs200) !== Math.sign(vs200ago) ? Math.sign(vs200) : 0,
      new52h: prior.length > 100 && Math.max(...recent) >= Math.max(...prior) ? 1 : 0,
      new52l: prior.length > 100 && Math.min(...recent) <= Math.min(...prior) ? 1 : 0,
      dd52: last.p / Math.max(...yr) - 1,
      z1d: sd > 0 && d1 !== null ? d1 / sd : null,
      z1w: sd > 0 && w1 !== null ? w1 / (sd * Math.sqrt(5)) : null,
      vol1m: sd21 * Math.sqrt(252), vol12m: sdY * Math.sqrt(252),
      m1hist,
      spark: s.slice(Math.max(0, n - 22)).map((x) => x.p / base),
    });
  }
  return out;
},
});
dash.calc('macro_live', {
  inputs: ['macro_px', 'treasury'],
  title: 'Live macro backdrop',
  description: 'Level and change of Treasury yields, the 2s10s curve, the dollar, high yield against Treasuries, oil, gold and the VIX over one day to twelve months, with moves measured against each series\u2019 own daily volatility.',
  fn: (macro_px, treasury) => {
  // rates, curve, dollar, credit, oil, gold and volatility: level and change over short and medium horizons
  const ser = {};
  for (const r of macro_px) (ser[r.symbol] = ser[r.symbol] || []).push({ d: String(r.date).slice(0, 10), v: Number(r.close) });
  const T = [...treasury].map((r) => ({ d: String(r.date).slice(0, 10), y10: Number(r.year10), y2: Number(r.year2), y3m: Number(r.month3) })).sort((a, b) => (a.d < b.d ? -1 : 1));
  ser.y10 = T.map((r) => ({ d: r.d, v: r.y10 }));
  ser.y2 = T.map((r) => ({ d: r.d, v: r.y2 }));
  ser.curve = T.map((r) => ({ d: r.d, v: r.y10 - r.y2 }));
  const hy = {}, ief = {};
  for (const x of ser.HYG || []) hy[x.d] = x.v;
  for (const x of ser.IEF || []) ief[x.d] = x.v;
  ser.credit = Object.keys(hy).filter((d) => ief[d]).sort().map((d) => ({ d, v: hy[d] / ief[d] }));
  const DEF = [
    ['y10', 'US 10-year yield', 'bp'], ['y2', 'US 2-year yield', 'bp'], ['curve', '2s10s curve', 'bp'],
    ['UUP', 'US dollar (UUP)', 'pct'], ['credit', 'High yield vs Treasuries (HYG/IEF)', 'pct'],
    ['USO', 'Oil (USO)', 'pct'], ['GLD', 'Gold (GLD)', 'pct'], ['^VIX', 'VIX', 'lvl'],
  ];
  const out = [];
  for (const [k, label, unit] of DEF) {
    const s = (ser[k] || []).filter((x) => isFinite(x.v)).sort((a, b) => (a.d < b.d ? -1 : 1));
    if (s.length < 30) continue;
    const n = s.length, last = s[n - 1].v;
    const at = (lag) => (n - 1 - lag >= 0 ? s[n - 1 - lag].v : null);
    const ch = (lag) => { const b = at(lag); return b === null ? null : unit === 'pct' ? last / b - 1 : unit === 'bp' ? (last - b) * 100 : last - b; };
    const daily = [];
    for (let i = Math.max(1, n - 252); i < n; i++) daily.push(unit === 'pct' ? s[i].v / s[i - 1].v - 1 : unit === 'bp' ? (s[i].v - s[i - 1].v) * 100 : s[i].v - s[i - 1].v);
    const m = daily.reduce((a, b) => a + b, 0) / daily.length;
    const sd = Math.sqrt(daily.reduce((a, b) => a + (b - m) ** 2, 0) / (daily.length - 1));
    const yr = s.slice(Math.max(0, n - 252)).map((x) => x.v);
    const w1 = ch(5), m1 = ch(21);
    out.push({
      key: k, label, unit, asOf: s[n - 1].d, level: last,
      d1: ch(1), w1, m1, m3: ch(63), m6: ch(126), m12: ch(252),
      z1w: sd > 0 && w1 !== null ? w1 / (sd * Math.sqrt(5)) : null,
      z1m: sd > 0 && m1 !== null ? m1 / (sd * Math.sqrt(21)) : null,
      pctile1y: yr.filter((v) => v <= last).length / yr.length,
      spark: s.slice(Math.max(0, n - 64)).map((x) => x.v),
    });
  }
  return out;
},
});

dash.loader('bond_history', {
  description: 'Runs the same price-history call for each bond ETF, a few at a time, and keeps symbol, date and dividend-adjusted close.',
  fn: async ({ answer, call, args }) => {
    const first = parseRows(answer);
    if (!first.length) throw new Error('FMP returned no price history for ' + args.symbol);
    const rest = await fetchAll(call, 'chart', ['SHY', 'IEI', 'IEF', 'TLH', 'TLT', 'GOVT', 'TIP', 'AGG', 'MBB', 'JAAA', 'MUB', 'QLTA', 'LQD', 'VCIT', 'IGSB', 'FLOT', 'HYBB', 'ANGL', 'HYG', 'USHY', 'BKLN', 'EMB', 'EMLC', 'BNDX', 'PFF', 'CWB'].map((symbol) => ({ ...args, symbol })), parseRows);
    return [...first, ...rest].map((r) => ({ symbol: r.symbol, date: String(r.date).slice(0, 10), adjClose: Number(r.adjClose) }));
  },
});
dash.calc('bond_short', {
  inputs: ['bond_history', 'bond_quotes'],
  title: 'Bond ETF returns, short and medium term',
  description: 'The same short-horizon return calculation as the equity sleeves, for the bond ETFs: today to two years, ending at the live price.',
  fn: (etf_history, etf_quotes) => {
  // short-horizon returns, trend breaks and unusual moves for each ETF, ending at today's live price
  const by = {};
  for (const r of etf_history) (by[r.symbol] = by[r.symbol] || []).push({ d: String(r.date).slice(0, 10), p: Number(r.adjClose) });
  const Q = {};
  for (const q of etf_quotes) Q[q.symbol] = q;
  const qDate = (q) => (q && Number(q.timestamp) > 0 ? new Date((Number(q.timestamp) - 4 * 3600) * 1000).toISOString().slice(0, 10) : null);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const out = [];
  for (const etf of Object.keys(by)) {
    const s = by[etf].filter((x) => x.p > 0).sort((a, b) => (a.d < b.d ? -1 : 1));
    if (s.length < 60) continue;
    const q = Q[etf], qd = qDate(q), qp = q ? Number(q.price) : 0;
    let live = false;
    if (qp > 0 && qd) {
      if (qd > s[s.length - 1].d) { s.push({ d: qd, p: qp }); live = true; }
      else if (qd === s[s.length - 1].d) { s[s.length - 1].p = qp; live = true; }
    }
    const n = s.length, last = s[n - 1];
    const back = (k) => (n - 1 - k >= 0 ? s[n - 1 - k].p : null);
    const before = (d) => { for (let i = n - 1; i >= 0; i--) if (s[i].d < d) return s[i].p; return null; };
    const r = (b) => (b ? last.p / b - 1 : null);
    const dt = new Date(last.d + 'T12:00:00Z');
    const mon = new Date(dt.getTime() - ((dt.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10);
    const lr = [];
    for (let i = Math.max(1, n - 63); i < n; i++) lr.push(Math.log(s[i].p / s[i - 1].p));
    const mu = avg(lr), sd = Math.sqrt(lr.reduce((x, y) => x + (y - mu) ** 2, 0) / (lr.length - 1));
    const lr21 = lr.slice(-21), mu21 = avg(lr21), sd21 = Math.sqrt(lr21.reduce((x, y) => x + (y - mu21) ** 2, 0) / (lr21.length - 1));
    const lrY = [];
    for (let i = Math.max(1, n - 252); i < n; i++) lrY.push(Math.log(s[i].p / s[i - 1].p));
    const muY = avg(lrY), sdY = Math.sqrt(lrY.reduce((x, y) => x + (y - muY) ** 2, 0) / (lrY.length - 1));
    const sma = (k, end) => (end >= k ? avg(s.slice(end - k, end).map((x) => x.p)) : null);
    const vsAt = (k, lag) => { const m = sma(k, n - lag); return m ? s[n - 1 - lag].p / m - 1 : null; };
    const vs200 = vsAt(200, 0), vs50 = vsAt(50, 0), vs200ago = vsAt(200, 10), vs200m = vsAt(200, 21);
    const yr = s.slice(Math.max(0, n - 252)).map((x) => x.p), prior = s.slice(Math.max(0, n - 252), n - 5).map((x) => x.p), recent = s.slice(n - 5).map((x) => x.p);
    const prev = n > 1 ? s[n - 2].p : null;
    const d1 = live && q && isFinite(Number(q.changePercentage)) ? Number(q.changePercentage) / 100 : r(prev);
    const w1 = r(back(5));
    const m1hist = [];
    for (let k = 0; k < 12; k++) { const a = back(21 * k), b = back(21 * (k + 1)); m1hist.push(a && b ? a / b - 1 : null); }
    const base = back(Math.min(21, n - 1));
    out.push({
      etf, asOf: last.d, live,
      d1, wtd: r(before(mon)), w1, mtd: r(before(last.d.slice(0, 8) + '01')), m1: r(back(21)), m3: r(back(63)), ytd: r(before(last.d.slice(0, 4) + '-01-01')), m12: r(back(252)),
      qtd: r(before(last.d.slice(0, 5) + String(Math.floor((Number(last.d.slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, '0') + '-01')), m6: r(back(126)),
      y2: n > 504 ? Math.pow(last.p / back(504), 0.5) - 1 : null,
      vs50, vs200, vs200ago, vs200m,
      cross200: vs200 !== null && vs200ago !== null && Math.sign(vs200) !== Math.sign(vs200ago) ? Math.sign(vs200) : 0,
      new52h: prior.length > 100 && Math.max(...recent) >= Math.max(...prior) ? 1 : 0,
      new52l: prior.length > 100 && Math.min(...recent) <= Math.min(...prior) ? 1 : 0,
      dd52: last.p / Math.max(...yr) - 1,
      z1d: sd > 0 && d1 !== null ? d1 / sd : null,
      z1w: sd > 0 && w1 !== null ? w1 / (sd * Math.sqrt(5)) : null,
      vol1m: sd21 * Math.sqrt(252), vol12m: sdY * Math.sqrt(252),
      m1hist,
      spark: s.slice(Math.max(0, n - 22)).map((x) => x.p / base),
    });
  }
  return out;
},
});
dash.calc('curve_live', {
  inputs: ['treasury'],
  title: 'Treasury curve now and before',
  description: 'Each maturity\u2019s yield today and one day, one week, one month, three months and one year earlier, and the changes in basis points; plus the 3m10y, 2s10s and 5s30s spreads.',
  fn: (treasury) => {
  // the Treasury curve today and at earlier dates, with changes in basis points
  const T = [...treasury].filter((r) => r && r.date).sort((a, b) => (a.date < b.date ? -1 : 1));
  const TEN = [['month1', '1M', 1 / 12], ['month3', '3M', 0.25], ['month6', '6M', 0.5], ['year1', '1Y', 1], ['year2', '2Y', 2], ['year3', '3Y', 3], ['year5', '5Y', 5], ['year7', '7Y', 7], ['year10', '10Y', 10], ['year20', '20Y', 20], ['year30', '30Y', 30]];
  const SPR = [['s3m10y', '3M\u201310Y', 'year10', 'month3'], ['s2s10s', '2Y\u201310Y', 'year10', 'year2'], ['s5s30s', '5Y\u201330Y', 'year30', 'year5']];
  if (!T.length) return [];
  const n = T.length, last = T[n - 1];
  const atLag = (k) => T[Math.max(0, n - 1 - k)];
  const atDays = (days) => { const t = new Date(new Date(last.date + 'T12:00:00Z').getTime() - days * 864e5).toISOString().slice(0, 10); let r = T[0]; for (const x of T) if (x.date <= t) r = x; return r; };
  const ref = { d1: atLag(1), w1: atLag(5), m1: atLag(21), m3: atLag(63), y1: atDays(365) };
  const num = (v) => (v === null || v === undefined || !isFinite(Number(v)) ? null : Number(v));
  const out = [];
  for (const [k, label, years] of TEN) {
    const o = { kind: 'tenor', key: k, label, years, asOf: last.date, now: num(last[k]) };
    for (const [p, r] of Object.entries(ref)) { o['at_' + p] = num(r[k]); o['ch_' + p] = o.now !== null && o['at_' + p] !== null ? (o.now - o['at_' + p]) * 100 : null; o['date_' + p] = r.date; }
    out.push(o);
  }
  for (const [k, label, a, b] of SPR) {
    const v = (r) => (num(r[a]) !== null && num(r[b]) !== null ? (num(r[a]) - num(r[b])) * 100 : null);
    const o = { kind: 'spread', key: k, label, asOf: last.date, now: v(last) };
    for (const [p, r] of Object.entries(ref)) { o['at_' + p] = v(r); o['ch_' + p] = o.now !== null && o['at_' + p] !== null ? o.now - o['at_' + p] : null; }
    o.series = T.slice(-260).map((r) => [r.date, v(r)]);
    out.push(o);
  }
  return out;
},
});

dash.loader('multi_history', {
  description: 'Runs the same price-history call for REITs, infrastructure, MLPs, commodities, currencies and bitcoin, a few at a time, and keeps symbol, date and dividend-adjusted close. Bitcoin keeps weekdays only, to line up with the other markets.',
  fn: async ({ answer, call, args }) => {
    const first = parseRows(answer);
    if (!first.length) throw new Error('FMP returned no price history for ' + args.symbol);
    const rest = await fetchAll(call, 'chart', ['VNQI', 'IGF', 'AMLP', 'DBC', 'GLD', 'SLV', 'USO', 'UNG', 'CPER', 'DBA', 'UUP', 'FXE', 'FXY', 'BTCUSD'].map((symbol) => ({ ...args, symbol })), parseRows);
    return [...first, ...rest].map((r) => ({ symbol: r.symbol, date: String(r.date).slice(0, 10), adjClose: Number(r.adjClose) }))
      .filter((r) => r.symbol !== 'BTCUSD' || [1, 2, 3, 4, 5].includes(new Date(r.date + 'T12:00:00Z').getUTCDay()));
  },
});
dash.calc('multi_hist_all', {
  inputs: ['etf_history', 'bond_history', 'multi_history'],
  title: 'Cross-asset price history',
  description: 'Daily dividend-adjusted closes for the multi-asset set, gathered from the equity, bond and other-asset histories.',
  fn: (etf_history, bond_history, multi_history) => { const S = new Set(['SGOV', 'ACWI', 'SPY', 'QQQ', 'IWM', 'VGK', 'EWJ', 'EEM', 'AGG', 'SHY', 'IEF', 'TLT', 'TIP', 'BNDX', 'MUB', 'LQD', 'HYG', 'BKLN', 'EMB', 'EMLC', 'VNQ', 'VNQI', 'IGF', 'AMLP', 'DBC', 'GLD', 'SLV', 'USO', 'UNG', 'CPER', 'DBA', 'UUP', 'FXE', 'FXY', 'BTCUSD']); return [...etf_history, ...bond_history, ...multi_history].filter((r) => S.has(r.symbol)); },
});
dash.calc('multi_quotes_all', {
  inputs: ['etf_quotes', 'bond_quotes', 'multi_quotes'],
  title: 'Cross-asset quotes',
  description: 'Live quotes for the multi-asset set, gathered from the equity, bond and other-asset quotes.',
  fn: (etf_quotes, bond_quotes, multi_quotes) => { const S = new Set(['SGOV', 'ACWI', 'SPY', 'QQQ', 'IWM', 'VGK', 'EWJ', 'EEM', 'AGG', 'SHY', 'IEF', 'TLT', 'TIP', 'BNDX', 'MUB', 'LQD', 'HYG', 'BKLN', 'EMB', 'EMLC', 'VNQ', 'VNQI', 'IGF', 'AMLP', 'DBC', 'GLD', 'SLV', 'USO', 'UNG', 'CPER', 'DBA', 'UUP', 'FXE', 'FXY', 'BTCUSD']), seen = new Set(); return [...etf_quotes, ...bond_quotes, ...multi_quotes].filter((q) => S.has(q.symbol) && !seen.has(q.symbol) && seen.add(q.symbol)); },
});
dash.calc('multi_short', {
  inputs: ['multi_hist_all', 'multi_quotes_all'],
  title: 'Cross-asset returns',
  description: 'Today to two years for every asset in the multi-asset set, ending at the live price.',
  fn: (etf_history, etf_quotes) => {
  // short-horizon returns, trend breaks and unusual moves for each ETF, ending at today's live price
  const by = {};
  for (const r of etf_history) (by[r.symbol] = by[r.symbol] || []).push({ d: String(r.date).slice(0, 10), p: Number(r.adjClose) });
  const Q = {};
  for (const q of etf_quotes) Q[q.symbol] = q;
  const qDate = (q) => (q && Number(q.timestamp) > 0 ? new Date((Number(q.timestamp) - 4 * 3600) * 1000).toISOString().slice(0, 10) : null);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const out = [];
  for (const etf of Object.keys(by)) {
    const s = by[etf].filter((x) => x.p > 0).sort((a, b) => (a.d < b.d ? -1 : 1));
    if (s.length < 60) continue;
    const q = Q[etf], qd = qDate(q), qp = q ? Number(q.price) : 0;
    let live = false;
    if (qp > 0 && qd) {
      if (qd > s[s.length - 1].d) { s.push({ d: qd, p: qp }); live = true; }
      else if (qd === s[s.length - 1].d) { s[s.length - 1].p = qp; live = true; }
    }
    const n = s.length, last = s[n - 1];
    const back = (k) => (n - 1 - k >= 0 ? s[n - 1 - k].p : null);
    const before = (d) => { for (let i = n - 1; i >= 0; i--) if (s[i].d < d) return s[i].p; return null; };
    const r = (b) => (b ? last.p / b - 1 : null);
    const dt = new Date(last.d + 'T12:00:00Z');
    const mon = new Date(dt.getTime() - ((dt.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10);
    const lr = [];
    for (let i = Math.max(1, n - 63); i < n; i++) lr.push(Math.log(s[i].p / s[i - 1].p));
    const mu = avg(lr), sd = Math.sqrt(lr.reduce((x, y) => x + (y - mu) ** 2, 0) / (lr.length - 1));
    const lr21 = lr.slice(-21), mu21 = avg(lr21), sd21 = Math.sqrt(lr21.reduce((x, y) => x + (y - mu21) ** 2, 0) / (lr21.length - 1));
    const lrY = [];
    for (let i = Math.max(1, n - 252); i < n; i++) lrY.push(Math.log(s[i].p / s[i - 1].p));
    const muY = avg(lrY), sdY = Math.sqrt(lrY.reduce((x, y) => x + (y - muY) ** 2, 0) / (lrY.length - 1));
    const sma = (k, end) => (end >= k ? avg(s.slice(end - k, end).map((x) => x.p)) : null);
    const vsAt = (k, lag) => { const m = sma(k, n - lag); return m ? s[n - 1 - lag].p / m - 1 : null; };
    const vs200 = vsAt(200, 0), vs50 = vsAt(50, 0), vs200ago = vsAt(200, 10), vs200m = vsAt(200, 21);
    const yr = s.slice(Math.max(0, n - 252)).map((x) => x.p), prior = s.slice(Math.max(0, n - 252), n - 5).map((x) => x.p), recent = s.slice(n - 5).map((x) => x.p);
    const prev = n > 1 ? s[n - 2].p : null;
    const d1 = live && q && isFinite(Number(q.changePercentage)) ? Number(q.changePercentage) / 100 : r(prev);
    const w1 = r(back(5));
    const m1hist = [];
    for (let k = 0; k < 12; k++) { const a = back(21 * k), b = back(21 * (k + 1)); m1hist.push(a && b ? a / b - 1 : null); }
    const base = back(Math.min(21, n - 1));
    out.push({
      etf, asOf: last.d, live,
      d1, wtd: r(before(mon)), w1, mtd: r(before(last.d.slice(0, 8) + '01')), m1: r(back(21)), m3: r(back(63)), ytd: r(before(last.d.slice(0, 4) + '-01-01')), m12: r(back(252)),
      qtd: r(before(last.d.slice(0, 5) + String(Math.floor((Number(last.d.slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, '0') + '-01')), m6: r(back(126)),
      y2: n > 504 ? Math.pow(last.p / back(504), 0.5) - 1 : null,
      vs50, vs200, vs200ago, vs200m,
      cross200: vs200 !== null && vs200ago !== null && Math.sign(vs200) !== Math.sign(vs200ago) ? Math.sign(vs200) : 0,
      new52h: prior.length > 100 && Math.max(...recent) >= Math.max(...prior) ? 1 : 0,
      new52l: prior.length > 100 && Math.min(...recent) <= Math.min(...prior) ? 1 : 0,
      dd52: last.p / Math.max(...yr) - 1,
      z1d: sd > 0 && d1 !== null ? d1 / sd : null,
      z1w: sd > 0 && w1 !== null ? w1 / (sd * Math.sqrt(5)) : null,
      vol1m: sd21 * Math.sqrt(252), vol12m: sdY * Math.sqrt(252),
      m1hist,
      spark: s.slice(Math.max(0, n - 22)).map((x) => x.p / base),
    });
  }
  return out;
},
});
dash.loader('fx_history', {
  description: 'Runs the same daily forex history call for twelve currencies against the dollar, a few at a time, keeps weekdays, and turns each into US dollars per unit of the currency so a rise means the currency gained.',
  fn: async ({ answer, call, args }) => {
    const first = parseRows(answer);
    if (!first.length) throw new Error('FMP returned no forex history for ' + args.symbol);
    const P = { EURUSD: ['EUR', 0], USDJPY: ['JPY', 1], GBPUSD: ['GBP', 0], USDCHF: ['CHF', 1], USDCAD: ['CAD', 1], AUDUSD: ['AUD', 0], USDCNY: ['CNY', 1], USDINR: ['INR', 1], USDKRW: ['KRW', 1], USDTWD: ['TWD', 1], USDBRL: ['BRL', 1], USDMXN: ['MXN', 1] };
    const rest = await fetchAll(call, 'forex', Object.keys(P).filter((s) => s !== args.symbol).map((symbol) => ({ ...args, symbol })), parseRows);
    return [...first, ...rest].filter((r) => P[r.symbol] && Number(r.price) > 0 && [1, 2, 3, 4, 5].includes(new Date(String(r.date).slice(0, 10) + 'T12:00:00Z').getUTCDay()))
      .map((r) => ({ symbol: P[r.symbol][0], date: String(r.date).slice(0, 10), adjClose: P[r.symbol][1] ? 1 / Number(r.price) : Number(r.price) }));
  },
});
dash.calc('fx_short', {
  inputs: ['fx_history'],
  title: 'Currency returns, short term',
  description: 'Today to two years for each currency against the dollar, from daily closes, with its position against the 200-day average.',
  fn: (fx_history) => ((etf_history, etf_quotes) => {
  // short-horizon returns, trend breaks and unusual moves for each ETF, ending at today's live price
  const by = {};
  for (const r of etf_history) (by[r.symbol] = by[r.symbol] || []).push({ d: String(r.date).slice(0, 10), p: Number(r.adjClose) });
  const Q = {};
  for (const q of etf_quotes) Q[q.symbol] = q;
  const qDate = (q) => (q && Number(q.timestamp) > 0 ? new Date((Number(q.timestamp) - 4 * 3600) * 1000).toISOString().slice(0, 10) : null);
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const out = [];
  for (const etf of Object.keys(by)) {
    const s = by[etf].filter((x) => x.p > 0).sort((a, b) => (a.d < b.d ? -1 : 1));
    if (s.length < 60) continue;
    const q = Q[etf], qd = qDate(q), qp = q ? Number(q.price) : 0;
    let live = false;
    if (qp > 0 && qd) {
      if (qd > s[s.length - 1].d) { s.push({ d: qd, p: qp }); live = true; }
      else if (qd === s[s.length - 1].d) { s[s.length - 1].p = qp; live = true; }
    }
    const n = s.length, last = s[n - 1];
    const back = (k) => (n - 1 - k >= 0 ? s[n - 1 - k].p : null);
    const before = (d) => { for (let i = n - 1; i >= 0; i--) if (s[i].d < d) return s[i].p; return null; };
    const r = (b) => (b ? last.p / b - 1 : null);
    const dt = new Date(last.d + 'T12:00:00Z');
    const mon = new Date(dt.getTime() - ((dt.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10);
    const lr = [];
    for (let i = Math.max(1, n - 63); i < n; i++) lr.push(Math.log(s[i].p / s[i - 1].p));
    const mu = avg(lr), sd = Math.sqrt(lr.reduce((x, y) => x + (y - mu) ** 2, 0) / (lr.length - 1));
    const lr21 = lr.slice(-21), mu21 = avg(lr21), sd21 = Math.sqrt(lr21.reduce((x, y) => x + (y - mu21) ** 2, 0) / (lr21.length - 1));
    const lrY = [];
    for (let i = Math.max(1, n - 252); i < n; i++) lrY.push(Math.log(s[i].p / s[i - 1].p));
    const muY = avg(lrY), sdY = Math.sqrt(lrY.reduce((x, y) => x + (y - muY) ** 2, 0) / (lrY.length - 1));
    const sma = (k, end) => (end >= k ? avg(s.slice(end - k, end).map((x) => x.p)) : null);
    const vsAt = (k, lag) => { const m = sma(k, n - lag); return m ? s[n - 1 - lag].p / m - 1 : null; };
    const vs200 = vsAt(200, 0), vs50 = vsAt(50, 0), vs200ago = vsAt(200, 10), vs200m = vsAt(200, 21);
    const yr = s.slice(Math.max(0, n - 252)).map((x) => x.p), prior = s.slice(Math.max(0, n - 252), n - 5).map((x) => x.p), recent = s.slice(n - 5).map((x) => x.p);
    const prev = n > 1 ? s[n - 2].p : null;
    const d1 = live && q && isFinite(Number(q.changePercentage)) ? Number(q.changePercentage) / 100 : r(prev);
    const w1 = r(back(5));
    const m1hist = [];
    for (let k = 0; k < 12; k++) { const a = back(21 * k), b = back(21 * (k + 1)); m1hist.push(a && b ? a / b - 1 : null); }
    const base = back(Math.min(21, n - 1));
    out.push({
      etf, asOf: last.d, live,
      d1, wtd: r(before(mon)), w1, mtd: r(before(last.d.slice(0, 8) + '01')), m1: r(back(21)), m3: r(back(63)), ytd: r(before(last.d.slice(0, 4) + '-01-01')), m12: r(back(252)),
      qtd: r(before(last.d.slice(0, 5) + String(Math.floor((Number(last.d.slice(5, 7)) - 1) / 3) * 3 + 1).padStart(2, '0') + '-01')), m6: r(back(126)),
      y2: n > 504 ? Math.pow(last.p / back(504), 0.5) - 1 : null,
      vs50, vs200, vs200ago, vs200m,
      cross200: vs200 !== null && vs200ago !== null && Math.sign(vs200) !== Math.sign(vs200ago) ? Math.sign(vs200) : 0,
      new52h: prior.length > 100 && Math.max(...recent) >= Math.max(...prior) ? 1 : 0,
      new52l: prior.length > 100 && Math.min(...recent) <= Math.min(...prior) ? 1 : 0,
      dd52: last.p / Math.max(...yr) - 1,
      z1d: sd > 0 && d1 !== null ? d1 / sd : null,
      z1w: sd > 0 && w1 !== null ? w1 / (sd * Math.sqrt(5)) : null,
      vol1m: sd21 * Math.sqrt(252), vol12m: sdY * Math.sqrt(252),
      m1hist,
      spark: s.slice(Math.max(0, n - 22)).map((x) => x.p / base),
    });
  }
  return out;
})(fx_history, []),
});
dash.loader('calendar_live', {
  description: 'Economic releases from today through the next ten days, with the consensus forecast and the previous reading, for the major economies; the saved call is for fixed dates and the page asks for the current ones.',
  fn: async ({ answer, call, args }) => {
    const iso = (t) => new Date(t).toISOString().slice(0, 10);
    const now = Date.now();
    let rows = [];
    try { rows = parseRows(await call('economics', { ...args, from_date: iso(now - 864e5), to_date: iso(now + 10 * 864e5) })); } catch (e) { rows = parseRows(answer); }
    const KEEP = new Set(['US', 'EU', 'DE', 'FR', 'IT', 'UK', 'JP', 'CN', 'CA', 'AU', 'CH', 'BR', 'MX', 'IN', 'KR']);
    return rows.filter((r) => KEEP.has(r.country) && (r.impact === 'High' || r.impact === 'Medium'))
      .map((r) => ({ date: String(r.date), country: r.country, event: r.event, impact: r.impact, estimate: r.estimate, previous: r.previous, actual: r.actual, unit: r.unit }));
  },
});
dash.calc('multi_corr', {
  inputs: ['multi_hist_all'],
  title: 'Cross-asset correlations',
  description: 'Correlation of daily returns between US equities and Treasuries, gold, the dollar and oil over the latest three months and year, and the same three-month window one year earlier.',
  fn: (multi_hist_all) => {
  // rolling correlations of daily returns between US equities and other assets
  const by = {};
  for (const r of multi_hist_all) (by[r.symbol] = by[r.symbol] || new Map()).set(String(r.date).slice(0, 10), Number(r.adjClose));
  const ret = (s) => { const m = by[s]; if (!m) return new Map(); const d = [...m.keys()].sort(), o = new Map(); for (let i = 1; i < d.length; i++) { const a = m.get(d[i - 1]), b = m.get(d[i]); if (a > 0 && b > 0) o.set(d[i], b / a - 1); } return o; };
  const R = ret('SPY');
  const dates = [...R.keys()].sort();
  const corr = (x, y) => { const n = x.length; if (n < 20) return null; const mx = x.reduce((a, b) => a + b, 0) / n, my = y.reduce((a, b) => a + b, 0) / n; let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; } return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null; };
  const out = [];
  for (const [s, label] of [['IEF', 'Treasuries 7-10y'], ['TLT', 'Treasuries 20y+'], ['GLD', 'Gold'], ['UUP', 'US dollar'], ['USO', 'Oil'], ['HYG', 'High yield'], ['BTCUSD', 'Bitcoin']]) {
    const O = ret(s);
    const win = (endIdx, n) => { const ds = dates.slice(Math.max(0, endIdx - n + 1), endIdx + 1).filter((d) => O.has(d)); return corr(ds.map((d) => R.get(d)), ds.map((d) => O.get(d))); };
    const e = dates.length - 1;
    out.push({ asset: s, label, c3m: win(e, 63), c1y: win(e, 252), c3mYearAgo: win(e - 252, 63) });
  }
  return out;
},
});
