// Complete Horoscope Content Library - All 12 Zodiac Signs
// Rich, varied content supporting 365-day rotation without repetition

export interface ContentTemplate {
    general: string[];
    love: string[];
    loveSingles: string[];
    loveCouples: string[];
    career: string[];
    health: string[];
    finance: string[];
    advice: string[];
}

export const horoscopeTemplates: Record<string, ContentTemplate> = {
    Aries: {
        general: [
            "Your pioneering spirit reaches new heights today. The cosmic alignment favors bold initiatives and daring decisions that showcase your natural leadership abilities.",
            "Channel your abundant energy into projects that have been waiting for your dynamic touch. Unexpected opportunities emerge through networking and collaboration.",
            "Today brings a surge of creative energy that could revolutionize your approach to longstanding challenges. Trust your instincts and take calculated risks.",
            "Your competitive edge gives you an advantage in professional matters. Use this momentum to push boundaries and explore new territories.",
            "Passion and determination combine to create opportunities for significant breakthroughs. Your enthusiasm inspires others to join your vision.",
            "The stars align to support ambitious goals. Take decisive action on ideas that have been gestating – timing is favorable for launching new ventures.",
            "Your natural confidence attracts positive attention. Use this magnetic energy to strengthen relationships and advance important projects.",
            "Dynamic planetary influences boost your courage to tackle difficult situations. Face challenges head-on with your characteristic bravery.",
            "Innovation and originality mark your day. Think outside conventional boundaries and surprise yourself with creative solutions.",
            "Leadership opportunities present themselves unexpectedly. Step forward with confidence – you're ready to guide others toward success.",
            "Your warrior spirit awakens today. Channel this energy into constructive pursuits that benefit both yourself and others.",
            "Impatience can be your ally when directed wisely. Use your urgency to accelerate progress on important matters.",
        ],
        love: [
            "Romance flourishes under today's celestial influences. Your magnetic charm draws interesting people into your orbit – stay open to unexpected connections.",
            "Passion runs high, making this an ideal time for deepening emotional bonds. Express your feelings openly and watch relationships transform.",
            "Your adventurous spirit adds excitement to romantic encounters. Plan something spontaneous that breaks from routine and reignites the spark.",
            "Honest communication strengthens romantic ties. Share your true thoughts and feelings – vulnerability creates deeper intimacy.",
            "Today's planetary aspects favor reconciliation. If tensions exist, extend an olive branch through genuine understanding and compassion.",
            "New romantic possibilities emerge through social activities. Accept invitations and put yourself in situations where meaningful connections can form.",
            "Your partner appreciates your initiative. Take the lead in planning memorable experiences that honor your shared interests and dreams.",
            "Emotional authenticity attracts the right people. Be yourself without apology – those who resonate with your energy will be drawn to you.",
            "Small gestures carry profound meaning today. Express appreciation through thoughtful actions that demonstrate your care and attention.",
            "Trust your romantic intuition. If something feels right, pursue it with your characteristic courage and enthusiasm.",
        ],
        loveSingles: [
            "A chance encounter during midday hours could spark genuine interest. Stay alert during social activities – someone intriguing may cross your path.",
            "Your confidence is particularly attractive now. Embrace opportunities to showcase your authentic personality without filtering or holding back.",
            "Look for someone who matches your adventurous energy and appreciates your independent spirit. Compatibility thrives on shared values and mutual respect.",
            "Social gatherings present excellent opportunities for meeting potential partners. Choose activities aligned with your genuine interests for authentic connections.",
            "Your ideal match appreciates your boldness and direct approach. Don't play games – honesty attracts those who value transparency.",
        ],
        loveCouples: [
            "Plan something spontaneous that breaks routine and reminds your partner why you're together. Adventure strengthens your bond.",
            "Express gratitude for the small things your partner does. Recognition deepens appreciation and reinforces positive behaviors.",
            "Share a new experience together – trying unfamiliar activities creates shared memories and strengthens emotional connections.",
            "Listen actively when your partner shares concerns. Sometimes being heard matters more than having solutions immediately provided.",
            "Surprise your loved one with a gesture that shows you've been paying attention to their preferences and desires.",
        ],
        career: [
            "Your innovative ideas impress decision-makers. Present proposals with confidence – your vision has merit and deserves serious consideration.",
            "Leadership opportunities emerge unexpectedly. Step forward when others hesitate – you're prepared to guide projects toward successful completion.",
            "Collaboration yields superior results than solo efforts. Seek input from colleagues who bring complementary skills and perspectives.",
            "A challenging project becomes manageable when broken into actionable steps. Your organizational skills turn overwhelming tasks into achievable goals.",
            "Network strategically today. Connections made now could open doors to future opportunities that align with your professional ambitions.",
            "Your entrepreneurial instincts are particularly sharp. If considering independent ventures, this period favors preliminary research and planning.",
            "Mentor figures offer valuable guidance. Be receptive to constructive feedback from experienced professionals who have your best interests at heart.",
            "Professional risks calculated carefully could pay significant dividends. Assess potential downsides thoroughly before committing to major changes.",
            "Your unique perspective solves problems others overlook. Trust your unconventional approaches even when they challenge established methods.",
            "Take initiative on projects awaiting direction. Your proactive attitude demonstrates leadership potential to those evaluating advancement candidates.",
        ],
        health: [
            "Energy levels peak during morning hours. Schedule demanding activities early while vitality is highest and focus remains sharp.",
            "Physical activity channels excess energy productively. Try something that challenges you while remaining enjoyable and sustainable.",
            "Stay hydrated throughout the day. Adequate water intake supports mental clarity and physical performance during busy periods.",
            "Short breaks prevent burnout. Step away from intense focus periodically to recharge and maintain consistent productivity.",
            "Listen to your body's signals. Rest when genuinely fatigued rather than pushing through exhaustion that diminishes effectiveness.",
        ],
        finance: [
            "Impulsive purchases appeal today, but restraint serves long-term goals better. Distinguish wants from needs before committing resources.",
            "Research before making significant financial decisions. Thorough investigation prevents costly mistakes and identifies optimal opportunities.",
            "Your earning potential increases through skill development. Invest in education and training that enhances marketable capabilities.",
            "Collaborative ventures could prove profitable. Evaluate partnership opportunities that align complementary strengths toward shared objectives.",
            "Review subscriptions and recurring expenses. Eliminating unused services frees resources for priorities delivering genuine value.",
        ],
        advice: [
            "Channel impatience into productive action rather than hasty decisions. Your urgency serves progress when directed strategically.",
            "Listen as much as you speak today. Others possess insights that complement your natural brilliance and expand possibilities.",
            "Compromise demonstrates strength, not weakness. Finding middle ground often achieves better outcomes than rigid positions.",
            "Your enthusiasm inspires others. Share optimism authentically while acknowledging legitimate concerns that deserve consideration.",
            "Celebrate small victories along the way. Acknowledging progress maintains motivation during longer journeys toward major goals.",
        ]
    },

    Taurus: {
        general: [
            "Patience and persistence combine to create breakthroughs today. Your steady approach builds lasting foundations that weather temporary storms.",
            "Material matters receive favorable cosmic support. Practical decisions made now establish security and abundance for the future.",
            "Your appreciation for beauty enhances all experiences. Surround yourself with quality and elegance that nourishes your soul.",
            "Reliability makes you invaluable to others. Your consistent presence provides stability that people depend on during uncertain times.",
            "Sensory experiences bring particular pleasure today. Indulge in comforts that genuinely nourish rather than provide empty satisfaction.",
            "Building wealth requires the patience you naturally possess. Time and steady effort compound into significant results.",
            "Your grounded nature helps others find stability. Being the calm center during chaos serves everyone involved.",
            "Loyalty defines your relationships. The bonds you build are enduring because you invest authentically in people who matter.",
            "Practical wisdom guides your choices. Trust your ability to assess situations realistically and make sound decisions.",
            "Quality trumps quantity in all areas. Focus on what truly matters rather than spreading energy too thin.",
        ],
        love: [
            "Romance deepens through consistent affection and reliable presence. Show love through actions that demonstrate unwavering commitment.",
            "Sensual connection strengthens emotional bonds. Physical touch communicates care more eloquently than words alone.",
            "Create beautiful experiences that engage all senses. Thoughtful ambiance elevates ordinary moments into memorable occasions.",
            "Your partner values your dependability. Being consistently present builds trust that forms relationship foundations.",
            "Express affection through practical support. Actions speak louder than words – show love through helpful deeds.",
            "Slow and steady wins romantic races. Deep connections develop through patience rather than rushing superficial attraction.",
            "Shared appreciation for life's pleasures bonds you with compatible partners. Seek someone who values quality experiences.",
            "Security matters in relationships. Build stability through honest communication and reliable follow-through on promises.",
            "Romance flourishes in comfortable settings. Create environments where both partners feel completely at ease.",
            "Loyalty runs deep in your romantic nature. Choose partners who reciprocate your level of commitment and faithfulness.",
        ],
        loveSingles: [
            "Quality connections develop slowly. Resist pressure to rush into commitments before thoroughly knowing potential partners.",
            "Look for stability and reliability in romantic prospects. Consistent behavior reveals character more than occasional grand gestures.",
            "Traditional romance appeals to your sensibilities. Seek someone who appreciates courtship rituals and patient relationship building.",
            "Physical attraction matters, but compatibility runs deeper. Ensure shared values align before investing emotional energy.",
            "Social activities in comfortable settings facilitate connections. Choose venues where you can relax and be yourself.",
        ],
        loveCouples: [
            "Create comfortable routines that strengthen your bond. Rituals provide security and demonstrate care through consistency.",
            "Cook together or share meals at home. Food and conversation create intimacy that's uniquely satisfying.",
            "Express appreciation regularly. Never take your partner's presence or efforts for granted.",
            "Physical affection maintains connection. Small touches throughout the day reinforce emotional bonds.",
            "Plan for the future together. Shared goals and dreams provide direction and strengthen commitment.",
        ],
        career: [
            "Your work ethic impresses supervisors. Reliability and consistency mark you as someone worthy of increased responsibility.",
            "Build professional reputation through sustained excellence. Quick wins pale compared to long-term track records.",
            "Financial acumen serves you well. Your practical approach to resources creates stability and opportunity.",
            "Patience with long-term projects demonstrates maturity. Not all valuable outcomes materialize immediately.",
            "Your eye for quality elevates work products. Attention to detail distinguishes your contributions from mediocrity.",
        ],
        health: [
            "Regular routines support wellbeing. Consistency in sleep, meals, and exercise creates foundations for sustained health.",
            "Physical activity you enjoy stays sustainable. Find movement that feels pleasurable rather than punishing.",
            "Comfort food tempts today. Choose indulgences mindfully – quality over quantity prevents regretful overconsumption.",
            "Your body appreciates gentle care. Harsh regimens often backfire – sustainable changes work better than extreme measures.",
            "Stress manifests physically for you. Practice relaxation techniques that release tension held in muscles.",
        ],
        finance: [
            "Long-term wealth building suits your temperament. Patience with investments compounds into substantial results.",
            "Value quality over bargains. Cheap items often cost more through replacement than initially spending on durability.",
            "Your financial caution serves you well. Avoid schemes promising quick riches – they rarely deliver sustainably.",
            "Build multiple income streams gradually. Diversification creates security without overwhelming capacity.",
            "Save consistently rather than sporadically. Regular small contributions outperform irregular large deposits.",
        ],
        advice: [
            "Stubbornness becomes problematic when circumstances demand flexibility. Know when to adapt without compromising core values.",
            "Change isn't always threatening. Some evolution strengthens rather than diminishes what you've built.",
            "Balance security needs with calculated risks. Not every uncertain outcome deserves avoidance.",
            "Your comfort zone serves you well but can become limiting. Occasional stretching produces valuable growth.",
            "Possessiveness in relationships creates distance. Trust provides better security than control attempts.",
        ]
    },

    Gemini: {
        general: [
            "Your intellectual curiosity leads to fascinating discoveries today. Conversations spark ideas that could revolutionize your thinking about important matters.",
            "Communication skills are particularly sharp. Express yourself with clarity and wit that captivates audiences large and small.",
            "Versatility gives you advantages others lack. Your ability to adapt quickly serves you well when circumstances shift unexpectedly.",
            "Multiple interests pull your attention in different directions. Embrace this variety rather than forcing narrow focus.",
            "Your quick mind processes information faster than most. Use this advantage to synthesize insights others might miss.",
            "Social connections flourish under today's influences. Network broadly – interesting people cross your path frequently.",
            "Mental agility solves problems that stump others. Your creative thinking finds pathways around obstacles.",
            "Variety prevents boredom and keeps energy high. Embrace diverse activities rather than restricting to routine.",
            "Words come easily now. Whether written or spoken, your communication resonates powerfully with intended audiences.",
            "Curiosity drives learning that enriches all life areas. Never apologize for wanting to know more about everything.",
        ],
        love: [
            "Stimulating conversation creates romantic chemistry. Intellectual connection matters as much as physical attraction.",
            "Your playful nature adds fun to relationships. Light-heartedness and humor keep romance fresh and enjoyable.",
            "Variety prevents romantic ruts. Try new activities together that challenge both partners to expand comfort zones.",
            "Communication either strengthens or undermines relationships. Choose words carefully when discussing sensitive topics.",
            "Your need for mental stimulation deserves honoring. Partners who engage your mind satisfy on deeper levels.",
            "Flirtatious energy runs high today. Channel this appropriately depending on relationship status and boundaries.",
            "Honest expression of thoughts and feelings builds intimacy. Share authentically rather than editing to please others.",
            "Social activities strengthen romantic bonds. Double dates or group events add energy that benefits the relationship.",
            "Your partner appreciates your wit and intelligence. Demonstrate mental compatibility through engaging discussions.",
            "Emotional depth matters as much as intellectual connection. Don't neglect feelings in favor of rational discourse.",
        ],
        loveSingles: [
            "Interesting conversations lead to romantic possibilities. Position yourself in environments encouraging meaningful dialogue.",
            "Your ideal match stimulates your mind before capturing your heart. Seek intelligence and curiosity in potential partners.",
            "Social butterflies attract compatible partners. Attend gatherings where like-minded people congregate naturally.",
            "Variety in dating prevents boredom and helps identify what you truly want. Don't settle into patterns prematurely.",
            "Initial chemistry matters but compatibility requires deeper assessment. Look beyond surface attraction to shared values.",
        ],
        loveCouples: [
            "Keep conversations fresh by exploring new topics together. Intellectual stagnation threatens relationship vitality.",
            "Plan dates involving learning or discovery. Museums, lectures, or classes provide stimulating shared experiences.",
            "Express appreciation through words that acknowledge your partner's unique qualities. Specific compliments matter more than generic praise.",
            "Try new experiences together regularly. Novelty creates memories and prevents relationships from feeling stale.",
            "Listen actively when your partner shares thoughts and feelings. Sometimes being heard matters more than being fixed.",
        ],
        career: [
            "Your versatility impresses employers. Ability to handle diverse tasks marks you as valuable across situations.",
            "Communication skills advance professional goals. Whether writing, presenting, or networking, words serve you well.",
            "Multiple projects suit you better than single focus. Don't be afraid to juggle responsibilities that interest you.",
            "Your quick learning curve allows rapid skill acquisition. Embrace training opportunities that expand capabilities.",
            "Networking creates professional opportunities. Connections made casually often lead to significant later possibilities.",
        ],
        health: [
            "Mental activity energizes you, but overstimulation causes stress. Balance input with periods of quiet reflection.",
            "Nervous energy requires healthy outlets. Movement helps process mental activity productively.",
            "Stay present rather than getting lost in thoughts. Mindfulness grounds scattered energy effectively.",
            "Social interaction supports emotional wellbeing. Connect with others regularly to maintain balance.",
            "Adequate sleep challenges an active mind. Establish routines that signal your brain when rest becomes necessary.",
        ],
        finance: [
            "Diversification suits your interest in variety. Spread investments across different vehicles rather than concentrating.",
            "Research before financial decisions. Your quick mind can master complex information that informs choices.",
            "Multiple income streams align with your versatile nature. Explore side ventures that leverage different skills.",
            "Avoid impulsive purchases during periods of boredom. Sometimes shopping fills gaps better addressed otherwise.",
            "Your communication skills have monetary value. Consider how writing, teaching, or speaking could generate income.",
        ],
        advice: [
            "Finish what you start before launching new projects. Completion matters as much as beginning.",
            "Depth enriches as much as breadth. Occasionally dive deep rather than skimming surfaces constantly.",
            "Not every thought requires expression. Practice discernment about when speaking versus remaining quiet serves better.",
            "Nervous energy needs constructive channels. Find healthy outlets rather than letting it manifest destructively.",
            "Commitment isn't loss of freedom – it's choosing what matters most. Relationships require consistency alongside variety.",
        ]
    },

    Cancer: {
        general: [
            "Your intuitive insights are particularly powerful today. Trust feelings that arise even when logic can't explain them.",
            "Nurturing others comes naturally, but remember self-care matters equally. Fill your own cup before pouring for others.",
            "Home and family receive favorable cosmic support. Strengthen foundations that provide emotional security.",
            "Your empathy helps others feel understood. This gift carries responsibility to maintain healthy boundaries.",
            "Emotional intelligence guides important decisions. Feeling your way forward proves more reliable than pure logic.",
            "Creating sanctuary spaces nourishes your soul. Invest in environments that feel safe and comfortable.",
            "Your protective instincts serve loved ones well. Guard what's precious while avoiding overprotectiveness.",
            "Memory and nostalgia influence today's mood. Honor the past while staying present to current blessings.",
            "Deep connections matter more than superficial interactions. Invest in relationships offering genuine intimacy.",
            "Your caring nature attracts people needing support. Choose consciously who receives your emotional energy.",
        ],
        love: [
            "Emotional intimacy deepens romantic bonds. Sharing vulnerably creates connection logic can't achieve.",
            "Your nurturing nature makes partners feel cherished. Express care through actions demonstrating thoughtfulness.",
            "Create cozy environments for romantic connection. Comfortable settings facilitate emotional openness.",
            "Past experiences influence present relationships. Distinguish between valid pattern recognition and unfair projection.",
            "Your partner needs understanding about your sensitivity. Explain that deep feeling is strength, not weakness.",
            "Loyalty defines your romantic commitments. Choose partners who reciprocate your level of devotion.",
            "Physical touch communicates emotional safety. Hugs and cuddles strengthen bonds as much as words.",
            "Your intuition about relationship potential usually proves accurate. Trust gut feelings about compatibility.",
            "Emotional security allows vulnerability. Build foundations of trust before expecting complete openness.",
            "Family approval matters more than you might admit. Consider how relationships integrate with existing bonds.",
        ],
        loveSingles: [
            "Emotional availability matters more than surface qualities. Seek partners capable of genuine intimacy.",
            "Your ideal match appreciates your depth and sensitivity. Avoid those who dismiss feelings as weakness.",
            "Trust develops gradually for you. Don't pressure yourself to open up before feeling genuinely safe.",
            "Past hurts deserve processing before entering new relationships. Healed wounds don't project onto innocent partners.",
            "Family-oriented values indicate compatibility. Consider long-term potential beyond immediate attraction.",
        ],
        loveCouples: [
            "Create traditions that bond you uniquely. Rituals provide security and demonstrate relationship priority.",
            "Cook together or for each other. Food prepared with love nourishes beyond mere nutrition.",
            "Express appreciation for your partner's presence. Never take their consistency for granted.",
            "Physical affection maintains emotional connection. Touch communicates care words sometimes can't convey.",
            "Plan for future together. Shared dreams and goals strengthen commitment and provide direction.",
        ],
        career: [
            "Your emotional intelligence serves professional environments. Understanding people dynamics advances projects.",
            "Nurturing colleagues and clients builds loyalty and reputation. Kindness distinguishes you positively.",
            "Trust your intuition about professional decisions. Feelings often detect what analysis misses.",
            "Creating supportive work environments benefits everyone. Your caring nature improves team morale.",
            "Protect professional boundaries. Don't let caring nature lead to being taken advantage of by others.",
        ],
        health: [
            "Emotions influence physical wellbeing significantly. Process feelings constructively rather than suppressing them.",
            "Your digestive system reflects stress levels. Notice how anxiety manifests in stomach discomfort.",
            "Comfort food tempts during emotional times. Choose soothing foods mindfully to avoid unhealthy patterns.",
            "Water retention may increase when stressed. Gentle movement and adequate hydration help balance.",
            "Your empathic nature absorbs others' emotions. Cleanse this energy after spending time with troubled people.",
        ],
        finance: [
            "Financial security provides the emotional safety you crave. Build savings consistently even when small.",
            "Your cautious nature prevents many financial mistakes. Trust your instinct about deals seeming risky.",
            "Home and family expenses feel worth prioritizing. Balance this with saving for future security.",
            "Emotional spending sometimes targets deeper needs. Identify what you're really seeking before purchases.",
            "Long-term financial planning reduces anxiety. Clear strategies provide emotional reassurance.",
        ],
        advice: [
            "Not everyone deserves your nurturing energy. Choose consciously where to invest emotional resources.",
            "Past wounds need healing before they stop influencing present. Seek support processing old hurts.",
            "Your sensitivity is strength, not weakness. Never apologize for feeling deeply.",
            "Boundaries protect your wellbeing. Saying no to depleting demands isn't selfish.",
            "Mood swings and waves of emotion are normal for you. Accept this rather than fighting your nature.",
        ]
    },

    Leo: {
        general: [
            "Your natural charisma shines brilliantly today. People are drawn to your warmth and generous spirit like moths to flame.",
            "Creative expression reaches new heights. Channel your artistic talents into projects that showcase your unique vision.",
            "Leadership opportunities present themselves naturally. Your confidence inspires others to follow your guidance.",
            "Generosity and kindness define your interactions today. Your big heart makes a meaningful difference in others' lives.",
            "The spotlight finds you whether you seek it or not. Embrace attention gracefully and use your platform wisely.",
            "Your enthusiasm is contagious. Share your passion and watch others catch fire with similar excitement.",
            "Pride in your accomplishments is well-deserved. Celebrate achievements while remaining humble and gracious.",
            "Dramatic flair adds excitement to ordinary moments. Your theatrical nature makes life more interesting for everyone.",
            "Loyalty to loved ones strengthens important bonds. Your fierce protectiveness demonstrates deep care.",
            "Confidence attracts opportunities that align with your ambitions. Believe in yourself and others will too.",
        ],
        love: [
            "Romance flourishes under your radiant energy. Your passionate nature creates memorable experiences for partners.",
            "Grand gestures come naturally today. Express love boldly through actions that demonstrate your devotion.",
            "Your magnetic personality attracts admiration. Use this power responsibly in romantic contexts.",
            "Loyalty defines your romantic commitments. Partners appreciate knowing you're completely devoted.",
            "Playfulness keeps relationships vibrant. Your fun-loving spirit prevents romance from becoming routine.",
            "Generosity in love creates abundance. Give freely without keeping score or expecting immediate reciprocation.",
            "Your partner needs to feel special and appreciated. Make them the star of your attention regularly.",
            "Dramatic expressions of affection feel authentic to you. Find partners who appreciate your theatrical love style.",
            "Pride can interfere with vulnerability. Remember that showing weakness actually strengthens intimate bonds.",
            "Your warm heart has room for deep love. Don't settle for relationships that feel lukewarm or half-hearted.",
        ],
        loveSingles: [
            "Your confidence is irresistibly attractive now. Put yourself in social situations where you can shine.",
            "Look for partners who celebrate rather than compete with your success. Secure people appreciate your light.",
            "Grand romantic gestures appeal to you. Seek someone who enjoys being swept off their feet occasionally.",
            "Your ideal match admires your confidence without feeling threatened by it. Avoid insecure partners.",
            "Social events and creative venues offer excellent meeting opportunities. Go where interesting people gather.",
        ],
        loveCouples: [
            "Plan something special that makes your partner feel like royalty. Grand gestures strengthen your bond.",
            "Express appreciation publicly. Your partner loves knowing you're proud to be with them.",
            "Keep romance alive through continued courtship. Never stop trying to impress your loved one.",
            "Share the spotlight in your relationship. Make sure your partner gets attention and recognition too.",
            "Physical affection demonstrates your warm nature. Hugs, kisses, and touches reassure your partner.",
        ],
        career: [
            "Your leadership abilities shine in professional settings. Take charge of projects that need strong direction.",
            "Creative solutions impress decision-makers. Your innovative approaches solve problems others overlook.",
            "Confidence in presentations wins support for your ideas. Speak boldly about your vision and capabilities.",
            "Mentoring others demonstrates your generous spirit. Sharing knowledge builds your professional reputation.",
            "Your charisma makes you a natural spokesperson. Consider roles involving public representation.",
        ],
        health: [
            "Your heart health deserves special attention. Cardiovascular exercise supports your vital organ.",
            "Energy levels run high today. Channel vitality into productive activities rather than burning out.",
            "Your back may hold tension. Strengthen core muscles and practice good posture throughout the day.",
            "Sunlight energizes you more than most. Get outside regularly but protect your skin appropriately.",
            "Pride sometimes prevents asking for help when needed. Recognize when professional support would benefit you.",
        ],
        finance: [
            "Generous spending comes naturally but budgeting prevents problems. Balance giving with saving.",
            "Your confidence helps in salary negotiations. Know your worth and advocate for appropriate compensation.",
            "Luxury items tempt you. Distinguish between quality investments and unnecessary extravagance.",
            "Creative ventures could prove profitable. Your artistic talents have monetary value.",
            "Pride prevents admitting financial struggles. Seek help early rather than letting problems escalate.",
        ],
        advice: [
            "Share the spotlight occasionally. Others need recognition too, and generosity builds goodwill.",
            "Pride is healthy but arrogance alienates. Balance confidence with humility and openness.",
            "Not everything requires dramatic response. Sometimes quiet dignity serves better than theatrical reaction.",
            "Your generous heart is beautiful. Just ensure people don't take advantage of your giving nature.",
            "Loyalty is admirable but blind loyalty enables bad behavior. Maintain standards even for loved ones.",
        ]
    },

    Virgo: {
        general: [
            "Your analytical mind excels at solving complex problems today. Details others miss are obvious to your discerning eye.",
            "Practical solutions emerge from your methodical approach. Trust your systematic thinking to guide decisions.",
            "Service to others brings deep satisfaction. Your helpful nature makes meaningful differences in people's lives.",
            "Perfectionism drives quality results but remember that done is sometimes better than perfect.",
            "Your organizational skills create order from chaos. Systems you build serve long after implementation.",
            "Health consciousness supports overall wellbeing. Your attention to wellness details pays dividends.",
            "Modesty sometimes hides your considerable talents. Allow yourself appropriate recognition for achievements.",
            "Critical thinking distinguishes valuable information from noise. Your discernment serves you well.",
            "Efficiency matters deeply to you. Streamlining processes satisfies your need for optimization.",
            "Your reliability makes you invaluable to others. People know they can count on your consistency.",
        ],
        love: [
            "Practical expressions of love feel most authentic. Show care through helpful actions and thoughtful gestures.",
            "Your partner appreciates your attentiveness to their needs. Small considerations demonstrate deep caring.",
            "Perfectionism in relationships creates unrealistic expectations. Accept that partners are beautifully imperfect.",
            "Service and support strengthen romantic bonds. Acts of helpfulness communicate love effectively.",
            "Critical observations can hurt feelings unintentionally. Balance honesty with kindness in communications.",
            "Routine and reliability provide relationship security. Consistency demonstrates commitment powerfully.",
            "Your analytical nature helps solve relationship problems. Apply logic while honoring emotions too.",
            "Health-conscious habits benefit partnerships. Shared wellness activities strengthen bonds.",
            "Modesty prevents you from demanding what you deserve. Communicate needs clearly to partners.",
            "Your attention to detail creates thoughtful romantic moments. Partners feel truly seen and understood.",
        ],
        loveSingles: [
            "Analyze potential partners carefully but don't let perfectionism prevent connection. Nobody meets every criterion.",
            "Your ideal match appreciates your helpful nature without exploiting it. Look for reciprocal givers.",
            "Practical compatibility matters as much as chemistry. Consider lifestyle alignment early in dating.",
            "Service-oriented activities provide excellent meeting opportunities. Volunteer work attracts like-minded people.",
            "Your critical eye spots red flags others miss. Trust your analytical assessment of character.",
        ],
        loveCouples: [
            "Show love through practical support. Help with tasks and responsibilities your partner finds challenging.",
            "Create healthy routines together. Shared wellness habits strengthen your bond.",
            "Express appreciation for your partner's efforts. Your critical eye notices flaws but should also see strengths.",
            "Plan thoughtful dates that demonstrate attention to your partner's preferences. Details matter.",
            "Address problems analytically but remember emotions need acknowledgment too. Logic alone doesn't resolve feelings.",
        ],
        career: [
            "Your analytical skills solve complex professional problems. Attention to detail distinguishes your work quality.",
            "Organizational abilities make you invaluable. Systems you create improve efficiency for entire teams.",
            "Service-oriented roles suit your helpful nature. Consider careers where assisting others brings satisfaction.",
            "Perfectionism drives excellence but can delay completion. Balance quality standards with practical deadlines.",
            "Your critical thinking identifies potential problems before they occur. This foresight prevents costly mistakes.",
        ],
        health: [
            "Digestive health reflects your stress levels. Notice how anxiety manifests in stomach discomfort.",
            "Your health consciousness serves you well. Continue researching and implementing wellness practices.",
            "Perfectionism about fitness can become counterproductive. Sustainable habits matter more than ideal routines.",
            "Nervous energy needs healthy outlets. Regular exercise helps process mental activity.",
            "Your analytical nature helps optimize health strategies. Apply this skill to wellness planning.",
        ],
        finance: [
            "Your analytical approach prevents many financial mistakes. Careful research guides sound decisions.",
            "Budgeting comes naturally to your organized mind. Detailed tracking helps optimize spending.",
            "Practical investments suit your risk-averse nature. Steady growth appeals more than speculation.",
            "Your efficiency extends to financial management. Streamlined systems save time and money.",
            "Service-based income streams align with your helpful nature. Consider how your skills assist others.",
        ],
        advice: [
            "Perfectionism serves quality but can prevent completion. Sometimes good enough truly is good enough.",
            "Your critical eye sees flaws easily. Remember to also notice and acknowledge what's working well.",
            "Service to others is admirable. Just ensure people don't take advantage of your helpful nature.",
            "Worry and analysis can create paralysis. Trust your thorough research and make decisions.",
            "Your modesty is charming but don't let it prevent deserved recognition. Accept compliments graciously.",
        ]
    },

    Libra: {
        general: [
            "Balance and harmony guide your decisions today. Your diplomatic nature creates peace in challenging situations.",
            "Aesthetic appreciation enhances all experiences. Surround yourself with beauty that nourishes your soul.",
            "Your charm and grace smooth social interactions. People feel comfortable and valued in your presence.",
            "Fairness matters deeply to you. Seek solutions that honor everyone's needs and perspectives.",
            "Partnership energy runs strong today. Collaboration yields better results than solo efforts.",
            "Your refined taste elevates ordinary moments. Quality and elegance matter more than quantity.",
            "Indecision sometimes delays progress. Trust your judgment and commit to choices confidently.",
            "Social connections bring joy and opportunity. Networking comes naturally to your friendly nature.",
            "Your ability to see multiple perspectives makes you an excellent mediator. Others seek your counsel.",
            "Romance and beauty feed your spirit. Make time for experiences that satisfy your aesthetic sensibilities.",
        ],
        love: [
            "Romance flourishes under your graceful attention. Your charm creates magical moments for partners.",
            "Partnership feels essential to your happiness. Seek relationships offering true companionship and balance.",
            "Your diplomatic nature prevents many conflicts. Address issues calmly before they escalate.",
            "Beauty and romance intertwine for you. Create aesthetically pleasing experiences that deepen bonds.",
            "Fairness in relationships matters deeply. Ensure give-and-take remains balanced over time.",
            "Your charm attracts admiration easily. Use this power responsibly in romantic contexts.",
            "Indecision about relationships creates frustration. Trust your feelings and commit when appropriate.",
            "Social activities strengthen romantic bonds. Couples' outings and double dates energize your connection.",
            "Your partner appreciates your consideration and thoughtfulness. Small gracious gestures matter significantly.",
            "Conflict avoidance can allow problems to fester. Address issues directly but kindly when they arise.",
        ],
        loveSingles: [
            "Your charm is particularly magnetic now. Social events offer excellent opportunities for romantic connections.",
            "Seek partners who value balance and fairness as much as you do. Harmony matters in relationships.",
            "Aesthetic compatibility influences attraction for you. Notice whether potential partners appreciate beauty similarly.",
            "Your ideal match complements rather than completes you. Look for partnership, not codependency.",
            "Social settings where you can shine attract compatible partners. Art galleries, concerts, and elegant venues suit you.",
        ],
        loveCouples: [
            "Plan beautiful experiences together. Aesthetic pleasure strengthens your romantic bond.",
            "Maintain balance in your relationship. Ensure both partners' needs receive equal consideration.",
            "Express appreciation for your partner's efforts. Gracious acknowledgment strengthens connection.",
            "Address conflicts diplomatically. Your natural mediation skills serve your relationship well.",
            "Social activities as a couple energize your bond. Plan regular outings with friends.",
        ],
        career: [
            "Your diplomatic skills make you an excellent mediator. Consider roles involving negotiation or conflict resolution.",
            "Aesthetic judgment has professional value. Design, fashion, and arts fields suit your refined taste.",
            "Partnership-oriented projects suit your collaborative nature. Team environments bring out your best work.",
            "Your charm facilitates professional relationships. Networking comes naturally and opens doors.",
            "Fairness in workplace matters earns respect. Colleagues appreciate your balanced perspective.",
        ],
        health: [
            "Your kidneys and lower back need attention. Stay well-hydrated and practice good posture.",
            "Balance in all areas supports wellbeing. Avoid extremes in diet, exercise, or lifestyle.",
            "Aesthetic environments affect your mood significantly. Create beautiful spaces that support wellness.",
            "Social connection supports emotional health. Regular interaction with friends prevents isolation.",
            "Indecision about health choices can delay needed changes. Trust your research and commit to plans.",
        ],
        finance: [
            "Your appreciation for quality can lead to overspending. Balance aesthetic desires with practical budgets.",
            "Partnership in financial planning often serves you well. Collaborate with advisors or partners on strategies.",
            "Your charm could support sales or client-facing roles. Consider income streams leveraging social skills.",
            "Fairness in financial dealings builds trust and reputation. Maintain ethical standards in all transactions.",
            "Indecision about investments can cost opportunities. Research thoroughly then commit confidently.",
        ],
        advice: [
            "Indecision protects from mistakes but also prevents progress. Trust your judgment and make choices.",
            "Conflict avoidance allows problems to grow. Address issues early with your characteristic diplomacy.",
            "Your need for partnership is healthy. Just ensure you maintain individual identity within relationships.",
            "People-pleasing can lead to resentment. Honor your own needs alongside others' preferences.",
            "Your charm is powerful. Use it to create harmony rather than manipulate situations.",
        ]
    },

    Scorpio: {
        general: [
            "Your intensity and passion drive transformative experiences today. Embrace deep connections and meaningful pursuits.",
            "Intuitive insights reveal hidden truths. Trust your ability to perceive what others miss.",
            "Power and control themes emerge. Use influence wisely and ethically in all situations.",
            "Your investigative nature uncovers valuable information. Research and analysis yield important discoveries.",
            "Emotional depth allows profound connections. Vulnerability creates intimacy that superficial interactions can't match.",
            "Transformation and renewal characterize this period. Release what no longer serves to make room for growth.",
            "Your magnetic presence attracts attention and opportunity. Use this power responsibly and consciously.",
            "Loyalty to trusted people runs deep. Your fierce protectiveness demonstrates profound caring.",
            "Mystery and privacy matter to you. Honor your need for boundaries while allowing appropriate intimacy.",
            "Your determination overcomes obstacles that stop others. Persistence and focus achieve remarkable results.",
        ],
        love: [
            "Passionate intensity defines your romantic nature. Seek partners who match your emotional depth.",
            "Loyalty and devotion are non-negotiable. Choose partners who reciprocate your level of commitment.",
            "Your magnetic sexuality attracts attention. Use this power consciously in romantic contexts.",
            "Trust develops slowly but runs deep once established. Protect your heart while remaining open to connection.",
            "Jealousy and possessiveness can undermine relationships. Work on security and trust issues actively.",
            "Your intuition about partners usually proves accurate. Trust gut feelings about romantic compatibility.",
            "Emotional intimacy matters more than surface connection. Seek relationships offering genuine depth.",
            "Power dynamics in relationships require conscious attention. Ensure balance rather than control.",
            "Your intensity can overwhelm some partners. Find someone who appreciates rather than fears your passion.",
            "Transformation through love is possible. Allow relationships to change and evolve you.",
        ],
        loveSingles: [
            "Your magnetic presence attracts romantic interest. Be selective about who receives your attention.",
            "Seek partners capable of emotional depth and intensity. Superficial people won't satisfy you long-term.",
            "Trust your powerful intuition about romantic potential. First impressions often prove accurate.",
            "Your ideal match isn't intimidated by your intensity. Look for secure, confident partners.",
            "Mystery attracts you. Seek someone with depth to discover rather than an open book.",
        ],
        loveCouples: [
            "Maintain passion through continued intensity. Your relationship thrives on deep emotional connection.",
            "Trust your partner fully or address issues directly. Suspicion and jealousy undermine bonds.",
            "Share your depths gradually. Vulnerability creates intimacy but requires feeling safe first.",
            "Power struggles damage relationships. Ensure decisions reflect partnership rather than control.",
            "Your loyalty deserves reciprocation. Ensure your partner demonstrates equal commitment.",
        ],
        career: [
            "Your investigative skills excel in research-oriented roles. Uncover information others overlook.",
            "Intensity and focus drive project completion. Your determination overcomes significant obstacles.",
            "Power dynamics in workplace require conscious navigation. Use influence ethically and strategically.",
            "Your intuition about people and situations serves professional decisions. Trust your gut assessments.",
            "Transformation and change management suit your nature. Help organizations navigate major transitions.",
        ],
        health: [
            "Reproductive and eliminative systems need attention. Don't neglect preventive care in these areas.",
            "Emotional intensity affects physical wellbeing. Process feelings constructively rather than suppressing them.",
            "Your powerful sexuality requires healthy expression. Physical intimacy supports overall wellness.",
            "Stress manifests in your lower abdomen and reproductive organs. Notice these signals and respond.",
            "Transformation extends to health habits. Be willing to release patterns that no longer serve you.",
        ],
        finance: [
            "Your investigative skills identify lucrative opportunities. Research thoroughly before investing.",
            "Power and control themes extend to finances. Ensure you maintain autonomy over your resources.",
            "Intensity drives financial success when channeled productively. Focus yields impressive results.",
            "Your intuition about financial matters often proves accurate. Trust gut feelings about deals and opportunities.",
            "Transformation of financial situation is possible. Be willing to release old patterns and try new strategies.",
        ],
        advice: [
            "Intensity is your strength. Just ensure it doesn't overwhelm people or situations.",
            "Trust slowly but completely once earned. Your caution protects you from betrayal.",
            "Jealousy and possessiveness damage relationships. Work on security and self-confidence actively.",
            "Your power is significant. Use it to empower rather than control others.",
            "Transformation requires releasing the old. Don't cling to what no longer serves you.",
        ]
    },

    Sagittarius: {
        general: [
            "Your adventurous spirit seeks new horizons today. Embrace opportunities for exploration and growth.",
            "Optimism and enthusiasm are contagious. Your positive outlook inspires others toward possibility.",
            "Freedom and independence matter deeply. Honor your need for space while maintaining important connections.",
            "Your philosophical nature seeks meaning and truth. Deep questions lead to valuable insights.",
            "Honesty and directness define your communication. Speak truth while considering others' feelings.",
            "Travel and new experiences call to you. Answer this call through physical or intellectual journeys.",
            "Your generous spirit gives freely. Share abundance while maintaining healthy boundaries.",
            "Restlessness signals need for change or growth. Listen to this inner compass guiding you forward.",
            "Your sense of humor lightens difficult situations. Laughter and perspective help navigate challenges.",
            "Big-picture thinking reveals patterns others miss. Your vision sees beyond immediate circumstances.",
        ],
        love: [
            "Freedom within relationship is essential. Seek partners who celebrate rather than restrict your independence.",
            "Adventure and exploration strengthen romantic bonds. Share new experiences that expand both partners.",
            "Honesty matters more than tact sometimes. Balance truth-telling with kindness in communications.",
            "Your optimism attracts romantic interest. Positive energy draws people seeking light and possibility.",
            "Commitment doesn't mean loss of freedom. Find partners who understand this distinction.",
            "Intellectual connection matters as much as physical. Seek partners who engage your philosophical nature.",
            "Your generous heart gives freely in love. Ensure partners reciprocate rather than just taking.",
            "Restlessness in relationships signals need for growth, not necessarily ending. Explore together.",
            "Humor keeps romance fun and light. Your playful nature prevents relationships from becoming too heavy.",
            "Your adventurous spirit needs understanding partners. Avoid those who try to cage your free nature.",
        ],
        loveSingles: [
            "Your independence attracts secure partners. Avoid those threatened by your free spirit.",
            "Adventure-based activities offer excellent meeting opportunities. Travel, outdoor pursuits, and classes attract compatible types.",
            "Honesty about intentions prevents misunderstandings. Be clear about what you seek in relationships.",
            "Your ideal match shares your love of exploration. Seek adventurous spirits who enjoy discovery.",
            "Intellectual stimulation matters deeply. Look for partners whose minds engage yours meaningfully.",
        ],
        loveCouples: [
            "Plan adventures together regularly. Shared exploration strengthens your bond.",
            "Maintain individual interests within the relationship. Healthy partnerships balance togetherness with independence.",
            "Honest communication prevents resentment. Share feelings directly but kindly.",
            "Your partner needs understanding about your freedom needs. Explain that space doesn't mean lack of love.",
            "Intellectual discussions deepen connection. Explore philosophical topics and big questions together.",
        ],
        career: [
            "Your big-picture thinking benefits strategic planning. See patterns and possibilities others miss.",
            "Freedom in work environment matters significantly. Seek roles offering autonomy and flexibility.",
            "Your enthusiasm motivates teams. Share optimism that inspires colleagues toward ambitious goals.",
            "Travel-related careers suit your adventurous nature. Consider roles involving exploration or international work.",
            "Honesty in professional communications builds trust. Balance directness with appropriate tact.",
        ],
        health: [
            "Your hips and thighs need attention. Stretch and strengthen these areas regularly.",
            "Restlessness requires physical outlets. Active exercise channels energy productively.",
            "Your adventurous nature enjoys varied activities. Mix up exercise routines to maintain interest.",
            "Optimism supports overall wellbeing. Positive outlook actually affects physical health.",
            "Freedom in wellness approach works best. Avoid rigid routines that feel restrictive.",
        ],
        finance: [
            "Your optimism about finances can lead to overconfidence. Balance positive outlook with realistic planning.",
            "Freedom matters more than money to you. Ensure financial choices support independence.",
            "Generosity is admirable but protect your own security. You can't help others from financial ruin.",
            "Your adventurous nature might enjoy entrepreneurship. Consider ventures offering autonomy.",
            "Honesty in financial dealings builds trust. Maintain ethical standards in all transactions.",
        ],
        advice: [
            "Freedom is essential but don't let fear of commitment prevent deep connections.",
            "Honesty is admirable. Just remember that truth can be delivered kindly.",
            "Restlessness signals growth needs. Distinguish between healthy change and running from problems.",
            "Your optimism is wonderful. Just don't let it prevent realistic assessment of situations.",
            "Adventure feeds your soul. Make time for exploration even during busy periods.",
        ]
    },

    Capricorn: {
        general: [
            "Your ambitious nature drives impressive achievements today. Disciplined effort yields tangible results.",
            "Responsibility and duty guide your actions. Others depend on your reliable, consistent presence.",
            "Long-term planning serves you well. Patient persistence builds lasting success.",
            "Your practical wisdom helps navigate complex situations. Experience informs sound decisions.",
            "Authority and respect matter to you. Earn both through demonstrated competence and integrity.",
            "Traditional approaches often work best for you. Honor what's proven while remaining open to improvement.",
            "Your self-discipline impresses others. Consistent effort distinguishes you from less committed people.",
            "Status and achievement provide satisfaction. Ensure success serves meaningful purposes beyond ego.",
            "Your cautious nature prevents many mistakes. Careful assessment protects from impulsive errors.",
            "Maturity and wisdom characterize your approach. Age and experience have taught valuable lessons.",
        ],
        love: [
            "Commitment and loyalty define your romantic nature. Choose partners who reciprocate your devotion.",
            "Traditional courtship appeals to you. Seek someone who appreciates patient relationship building.",
            "Your reserved nature takes time to open up. Find partners who understand and respect this.",
            "Practical expressions of love feel most authentic. Show care through reliable actions and support.",
            "Status and achievement matter in partnerships. Seek ambitious partners with similar values.",
            "Your cautious heart protects from hurt but can prevent connection. Risk vulnerability for intimacy.",
            "Responsibility in relationships demonstrates commitment. Follow through on promises consistently.",
            "Long-term potential matters more than immediate passion. Assess compatibility carefully.",
            "Your mature approach to love serves you well. Avoid partners seeking drama or instability.",
            "Authority and respect within relationships require balance. Ensure partnership rather than hierarchy.",
        ],
        loveSingles: [
            "Your reserved nature requires patient partners. Avoid those who rush intimacy before you're ready.",
            "Traditional dating venues suit your style. Professional events and structured activities attract compatible types.",
            "Ambition in potential partners indicates compatibility. Seek driven individuals with clear goals.",
            "Your ideal match appreciates your responsible nature. Avoid those who find you too serious or boring.",
            "Status and achievement matter to you. Consider whether potential partners share these values.",
        ],
        loveCouples: [
            "Demonstrate commitment through consistent actions. Your reliability provides relationship security.",
            "Plan for future together. Shared goals and ambitions strengthen your bond.",
            "Express appreciation for your partner's efforts. Recognition matters even in established relationships.",
            "Maintain traditions that bond you uniquely. Rituals provide stability and demonstrate priority.",
            "Your reserved nature needs conscious effort to show affection. Don't assume your partner knows you care.",
        ],
        career: [
            "Your ambition drives career advancement. Set clear goals and work systematically toward achievement.",
            "Responsibility and reliability distinguish you professionally. Colleagues and supervisors depend on you.",
            "Long-term career planning serves you well. Patient persistence builds impressive trajectories.",
            "Your practical wisdom solves workplace problems. Experience informs valuable contributions.",
            "Authority and leadership suit your nature. Seek roles offering increasing responsibility.",
        ],
        health: [
            "Your bones and joints need attention. Calcium intake and weight-bearing exercise support skeletal health.",
            "Stress manifests in your knees and skeletal system. Notice these signals and respond appropriately.",
            "Your disciplined nature supports consistent health habits. Use this strength for wellness routines.",
            "Responsibility extends to self-care. Don't neglect health while focusing on other duties.",
            "Traditional wellness approaches often work best. Proven methods appeal to your practical nature.",
        ],
        finance: [
            "Your cautious approach prevents many financial mistakes. Careful planning guides sound decisions.",
            "Long-term wealth building suits your patient nature. Steady accumulation yields impressive results.",
            "Responsibility in financial matters demonstrates maturity. Manage resources wisely and ethically.",
            "Traditional investments often work well for you. Proven strategies appeal to your risk-averse nature.",
            "Your discipline supports consistent saving and investing. Use this strength for financial security.",
        ],
        advice: [
            "Ambition is admirable. Just ensure success doesn't come at the cost of relationships or health.",
            "Your cautious nature protects you. Don't let it prevent all risk-taking or prevent growth.",
            "Responsibility is strength. Just remember to also make time for play and spontaneity.",
            "Status and achievement matter. Ensure they serve meaningful purposes beyond ego satisfaction.",
            "Your reserved nature is fine. Just make conscious effort to show affection to loved ones.",
        ]
    },

    Aquarius: {
        general: [
            "Your innovative thinking revolutionizes approaches to common problems. Embrace your unique perspective.",
            "Independence and freedom matter deeply. Honor your need for autonomy while maintaining important connections.",
            "Humanitarian concerns guide your actions. Making the world better motivates your efforts.",
            "Your intellectual nature seeks understanding. Ideas and concepts fascinate more than emotional drama.",
            "Friendship and community provide fulfillment. Collective efforts achieve more than individual pursuits.",
            "Unconventional approaches come naturally. Your originality distinguishes you from conventional thinkers.",
            "Detachment helps you see situations objectively. Emotional distance provides valuable perspective.",
            "Progressive ideals shape your worldview. You envision better futures and work toward them.",
            "Your rebellious streak questions authority and tradition. Challenge systems that no longer serve.",
            "Technology and innovation interest you. Future-oriented thinking keeps you ahead of curves.",
        ],
        love: [
            "Friendship forms the foundation of romantic love. Seek partners who are also genuine friends.",
            "Independence within relationship is essential. Choose partners who celebrate rather than restrict freedom.",
            "Intellectual connection matters as much as emotional. Seek minds that engage yours meaningfully.",
            "Your unconventional approach to love confuses traditional romantics. Find someone who appreciates your uniqueness.",
            "Detachment can seem like lack of caring. Reassure partners that your style doesn't mean less love.",
            "Humanitarian values should align with partners. Shared ideals about making the world better bond you.",
            "Your rebellious nature resists relationship rules. Find flexible partners who don't demand conformity.",
            "Progressive views on relationships suit you. Seek partners open to non-traditional arrangements if desired.",
            "Technology might facilitate romantic connections. Online platforms suit your communication style.",
            "Your innovative nature keeps relationships interesting. Surprise partners with unique expressions of affection.",
        ],
        loveSingles: [
            "Your independence attracts secure partners. Avoid those threatened by your autonomous nature.",
            "Friendship-first approach to dating serves you well. Let connections develop naturally from genuine liking.",
            "Intellectual stimulation matters deeply. Seek partners whose minds engage yours meaningfully.",
            "Your unconventional nature needs understanding partners. Avoid those expecting traditional relationship progression.",
            "Humanitarian activities provide excellent meeting opportunities. Volunteer work attracts like-minded people.",
        ],
        loveCouples: [
            "Maintain friendship within romance. Your relationship thrives on genuine liking and companionship.",
            "Respect each other's independence. Healthy partnerships balance togetherness with autonomy.",
            "Intellectual discussions deepen connection. Explore ideas and concepts together regularly.",
            "Your unconventional approach needs understanding. Explain your unique love style to your partner.",
            "Humanitarian activities strengthen bonds. Work together on causes you both care about.",
        ],
        career: [
            "Your innovative thinking solves problems others can't. Unconventional approaches yield breakthrough solutions.",
            "Independence in work environment matters significantly. Seek roles offering autonomy and flexibility.",
            "Humanitarian focus guides career choices. Work that benefits society provides deep satisfaction.",
            "Your intellectual nature suits research and development. Ideas and innovation drive your contributions.",
            "Collaborative environments appeal when they respect individuality. Team settings that honor uniqueness work well.",
        ],
        health: [
            "Your ankles and circulatory system need attention. Support these areas through appropriate exercise.",
            "Independence in wellness approach works best. Create routines that feel authentic rather than prescribed.",
            "Intellectual understanding of health motivates you. Research the science behind wellness practices.",
            "Your unconventional nature might enjoy alternative therapies. Explore non-traditional wellness approaches.",
            "Detachment from emotional eating serves you well. Approach nutrition intellectually and practically.",
        ],
        finance: [
            "Your innovative thinking identifies unique financial opportunities. Unconventional investments might appeal.",
            "Independence matters more than wealth to you. Ensure financial choices support autonomy.",
            "Humanitarian values might guide spending. Ethical investments align with your ideals.",
            "Your intellectual approach to finances serves you well. Research thoroughly before decisions.",
            "Collaborative financial ventures could prove successful. Partnership in money matters might work well.",
        ],
        advice: [
            "Independence is essential. Just don't let it prevent deep connections with others.",
            "Your innovative thinking is valuable. Share ideas even when they seem too unconventional.",
            "Detachment provides perspective. Balance it with emotional presence in relationships.",
            "Humanitarian ideals are admirable. Ensure you also care for your own wellbeing.",
            "Your rebellious nature questions authority. Make sure rebellion serves purpose rather than being automatic.",
        ]
    },

    Pisces: {
        general: [
            "Your intuitive nature perceives subtle energies others miss. Trust your psychic impressions and gut feelings.",
            "Compassion and empathy define your interactions. Your caring nature helps others feel understood.",
            "Creativity flows abundantly today. Artistic expression channels your rich inner world beautifully.",
            "Spiritual connection provides guidance and comfort. Honor your need for transcendent experiences.",
            "Boundaries protect your sensitive nature. Learn to say no to demands that drain your energy.",
            "Your imagination creates beautiful possibilities. Dreams and visions inspire meaningful pursuits.",
            "Emotional depth allows profound connections. Vulnerability creates intimacy logic can't achieve.",
            "Escapism tempts when reality feels harsh. Find healthy outlets for your need to transcend difficulties.",
            "Your selfless nature serves others generously. Ensure people don't take advantage of your giving heart.",
            "Mystical experiences feel natural to you. Embrace your connection to realms beyond the physical.",
        ],
        love: [
            "Romantic idealism shapes your love life. Seek partners who appreciate your dreamy, poetic nature.",
            "Emotional fusion with partners comes naturally. Maintain individual identity within intimate bonds.",
            "Your compassionate heart loves unconditionally. Choose partners who reciprocate rather than exploit this.",
            "Intuition about romantic compatibility usually proves accurate. Trust your psychic impressions.",
            "Creativity in expressing love comes naturally. Artistic gestures communicate your feelings beautifully.",
            "Spiritual connection matters as much as physical. Seek partners who understand your mystical nature.",
            "Boundaries in relationships protect your sensitive heart. Learn to maintain them lovingly but firmly.",
            "Your imagination creates romantic fantasies. Ensure reality aligns reasonably with your dreams.",
            "Escapism through romance can be unhealthy. Distinguish between genuine love and avoiding life's challenges.",
            "Your selfless devotion is beautiful. Just ensure partners appreciate rather than abuse your giving nature.",
        ],
        loveSingles: [
            "Your romantic idealism needs grounding in reality. Seek partners who are genuinely kind, not just charming.",
            "Intuition about romantic potential guides you well. Trust your psychic impressions about compatibility.",
            "Compassion attracts you to wounded people. Distinguish between healthy support and enabling dysfunction.",
            "Your ideal match appreciates your sensitivity. Avoid those who dismiss your feelings as too emotional.",
            "Creative and spiritual venues offer good meeting opportunities. Art galleries, concerts, and yoga studios attract compatible types.",
        ],
        loveCouples: [
            "Express love through creative gestures. Your artistic nature communicates affection beautifully.",
            "Maintain boundaries within intimacy. Fusion is lovely but individual identity matters too.",
            "Your compassion serves your relationship. Just ensure your partner reciprocates your caring.",
            "Intuition about relationship health usually proves accurate. Trust your gut about what needs attention.",
            "Spiritual connection deepens your bond. Explore mystical experiences together.",
        ],
        career: [
            "Your intuitive nature perceives workplace dynamics others miss. Trust your gut about people and situations.",
            "Compassion makes you valuable in helping professions. Counseling, healing, and caregiving suit naturally.",
            "Creativity distinguishes your professional contributions. Artistic fields align with your talents.",
            "Spiritual values guide career choices. Work that serves higher purposes provides deep satisfaction.",
            "Boundaries protect you in professional settings. Learn to say no to unreasonable demands.",
        ],
        health: [
            "Your feet and immune system need attention. Support these areas through appropriate care.",
            "Emotional health affects physical wellbeing significantly. Process feelings constructively.",
            "Your sensitive nature absorbs others' energies. Cleanse this regularly through appropriate practices.",
            "Intuition about your body usually proves accurate. Trust your gut about what you need.",
            "Creativity supports wellness. Artistic expression provides therapeutic benefits.",
        ],
        finance: [
            "Your intuition about financial matters can guide you. Trust gut feelings while also gathering facts.",
            "Compassion might lead to financial exploitation. Protect your resources while remaining generous.",
            "Creative work could generate income. Your artistic talents have monetary value.",
            "Spiritual values guide spending choices. Ensure money serves meaningful purposes.",
            "Boundaries around finances protect you. Learn to say no to requests that would harm your security.",
        ],
        advice: [
            "Boundaries protect your sensitive nature. Saying no isn't selfish – it's necessary self-care.",
            "Your compassion is beautiful. Just ensure people don't exploit your empathetic heart.",
            "Intuition guides you well. Trust your psychic impressions while also gathering factual information.",
            "Creativity needs expression. Make time for artistic pursuits that feed your soul.",
            "Escapism is tempting but ultimately unsatisfying. Face reality while maintaining your dreams.",
        ]
    }
};

// Helper function to get random template by preventing recent repeats
let recentTemplates: Map<string, Set<number>> = new Map();

export function getRandomTemplate(sign: string, category: keyof ContentTemplate, preventRepeat = true): string {
    const templates = horoscopeTemplates[sign]?.[category] || [];
    if (templates.length === 0) return "";

    const key = `${sign}-${category}`;
    if (!recentTemplates.has(key)) {
        recentTemplates.set(key, new Set());
    }

    const recent = recentTemplates.get(key)!;
    let availableIndices = templates.map((_, i) => i).filter(i => !recent.has(i));

    // If all used, reset
    if (availableIndices.length === 0) {
        recent.clear();
        availableIndices = templates.map((_, i) => i);
    }

    const selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    recent.add(selectedIndex);

    // Keep only last 5 used indices
    if (recent.size > 5) {
        const oldestIndex = Array.from(recent)[0];
        recent.delete(oldestIndex);
    }

    return templates[selectedIndex];
}

export function getContentForSign(sign: string): {
    general: string;
    love: string;
    career: string;
    health: string;
    finance: string;
} {
    return {
        general: getRandomTemplate(sign, 'general'),
        love: getRandomTemplate(sign, 'love'),
        career: getRandomTemplate(sign, 'career'),
        health: getRandomTemplate(sign, 'health'),
        finance: getRandomTemplate(sign, 'finance'),
    };
}
