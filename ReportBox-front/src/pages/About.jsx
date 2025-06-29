import { Scale, MessageCircle, FileText, Phone, Shield, Users, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const About = () => {

    const navigate=useNavigate();

    const handleChat=()=>{
        navigate('/chat');
    }

    const handleReport=()=>{
        navigate('/report');
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-60 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
        
        {/* Abstract Geometric Figures */}
        <div className="absolute top-32 right-1/4 w-32 h-32 border-2 border-blue-400/20 rotate-45 rounded-lg"></div>
        <div className="absolute bottom-60 right-10 w-24 h-24 border-2 border-purple-400/20 rounded-full"></div>
        <div className="absolute top-1/2 left-20 w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 transform rotate-12 rounded-lg"></div>
        
        {/* Floating Abstract Shapes */}
        <div className="absolute top-40 left-1/2 w-6 h-20 bg-gradient-to-b from-purple-400/30 to-transparent rounded-full transform -rotate-12"></div>
        <div className="absolute bottom-32 left-1/4 w-20 h-6 bg-gradient-to-r from-indigo-400/30 to-transparent rounded-full"></div>
        
        {/* Circuit-like Lines */}
        <div className="absolute top-80 right-1/3">
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"></div>
          <div className="w-0.5 h-16 bg-gradient-to-b from-blue-400/40 to-transparent ml-12 -mt-0.5"></div>
        </div>
        
        {/* Hexagonal Patterns */}
        <div className="absolute bottom-80 right-1/2">
          <div className="w-12 h-12 border border-cyan-400/20 transform rotate-45"></div>
          <div className="w-8 h-8 border border-purple-400/20 transform rotate-12 absolute -top-2 -right-2"></div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-8 shadow-2xl">
            <Scale className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            SEVAK
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Empowering citizens with instant access to legal knowledge, comprehensive reporting systems, 
            and direct connections to government authorities for a safer, more informed society.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 mb-20 border border-white/10">
          <div className="flex items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mr-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-lg text-gray-300 leading-relaxed">
            We believe that access to legal information should be universal and immediate. Our platform bridges 
            the gap between citizens and the law, providing instant guidance on rights, legal procedures, and 
            available remedies. By combining AI-powered legal assistance with direct government connectivity, 
            we're creating a more transparent and accessible justice system for everyone.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-16">Platform Features</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Legal Assistant */}
            <div className="group">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">AI Legal Chatbot</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Get instant answers to legal questions with our intelligent chatbot. Ask about your rights, 
                  legal procedures, or specific situations you're facing.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                    Specific article and section references
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
                    Context-aware legal guidance
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                    24/7 availability
                  </div>
                </div>
              </div>
            </div>

            {/* Complaint Reporting System */}
            <div className="group">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Report & Track</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Submit detailed reports about crimes or legal issues you're experiencing. 
                  Your complaints are directly monitored by government officials.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                    Direct government monitoring
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mr-3"></div>
                    Secure and confidential
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                    Real-time status updates
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="group">
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Emergency Contacts</h3>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  Access location-specific emergency contact numbers based on your state. 
                  Get immediate help when you need it most.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                    State-specific numbers
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                    Instant access
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mr-3"></div>
                    Location-aware service
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-8">How Our Platform Works</h2>
          <p className="text-lg text-gray-300 text-center mb-16 max-w-3xl mx-auto">
            Our comprehensive legal assistance platform follows a streamlined process designed to provide 
            immediate help while ensuring proper documentation and follow-up with authorities.
          </p>
          
          <div className="relative">
            {/* Enhanced Connection Lines with Abstract Elements */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 opacity-30"></div>
            <div className="hidden lg:block absolute top-1/2 left-1/4 w-2 h-2 bg-purple-400 rounded-full transform -translate-y-1"></div>
            <div className="hidden lg:block absolute top-1/2 left-2/4 w-2 h-2 bg-pink-400 rounded-full transform -translate-y-1"></div>
            <div className="hidden lg:block absolute top-1/2 left-3/4 w-2 h-2 bg-orange-400 rounded-full transform -translate-y-1"></div>
            
            <div className="grid lg:grid-cols-4 gap-8">
              {[
                {
                  step: "01",
                  title: "Ask Questions",
                  description: "Type your legal question in natural language",
                  detailedDesc: "Simply describe your situation or legal concern in everyday language. Our AI understands context and can help with queries like 'What are my rights if I'm being harassed at work?' or 'How do I file a complaint against a neighbor?'",
                  icon: MessageCircle,
                  color: "from-blue-500 to-cyan-500",
                  examples: ["Employment issues", "Property disputes", "Consumer rights", "Criminal concerns"]
                },
                {
                  step: "02",
                  title: "Get Precise Legal Guidance",
                  description: "Receive specific article and section references with actionable advice",
                  detailedDesc: "Our AI analyzes your query and provides relevant legal provisions, including specific article numbers, section details, and applicable laws. You'll get clear explanations of your rights and potential courses of action.",
                  icon: Zap,
                  color: "from-purple-500 to-pink-500",
                  examples: ["Article references", "Section details", "Legal definitions", "Rights explanation"]
                },
                {
                  step: "03",
                  title: "File Official Reports",
                  description: "Submit detailed complaints directly monitored by government officials",
                  detailedDesc: "When legal action is needed, use our secure reporting system to file official complaints. Your reports are immediately forwarded to relevant government departments and law enforcement agencies for investigation.",
                  icon: FileText,
                  color: "from-red-500 to-orange-500",
                  examples: ["Crime reports", "Fraud complaints", "Rights violations", "Corruption cases"]
                },
                {
                  step: "04",
                  title: "Connect & Take Action",
                  description: "Access emergency contacts and track your case progress",
                  detailedDesc: "Get immediate access to state-specific emergency numbers, track the status of your filed reports, and receive updates on government actions. Our system ensures continuous monitoring until resolution.",
                  icon: Phone,
                  color: "from-green-500 to-emerald-500",
                  examples: ["Emergency contacts", "Case tracking", "Status updates", "Follow-up actions"]
                }
              ].map((item, index) => (
                <div key={index} className="relative group">
                  {/* Abstract decorative elements for each step */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 border border-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-white/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105 h-full">
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-white/20 mb-4">{item.step}</div>
                      <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-6 transition-transform duration-300`}>
                        <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                    </div>
                    
                    <div className="text-left">
                      <p className="text-gray-300 text-sm leading-relaxed mb-4">{item.detailedDesc}</p>
                      
                      <div className="space-y-2">
                        <h4 className="text-white font-semibold text-sm mb-2">Examples:</h4>
                        {item.examples.map((example, idx) => (
                          <div key={idx} className="flex items-center text-xs text-gray-400">
                            <div className={`w-1.5 h-1.5 bg-gradient-to-r ${item.color} rounded-full mr-2`}></div>
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Process Flow Diagram */}
          <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-bold text-white text-center mb-8">Complete Process Flow</h3>
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">User Query</span>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">AI Analysis</span>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-purple-400 to-orange-400"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">Report Filing</span>
              </div>
              <div className="hidden md:block w-8 h-0.5 bg-gradient-to-r from-orange-400 to-green-400"></div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-gray-300 text-sm">Action & Resolution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Metrics */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-8">Platform Impact</h2>
          <p className="text-lg text-gray-300 text-center mb-16 max-w-3xl mx-auto">
            Real numbers that demonstrate our commitment to serving citizens and improving access to justice across the country.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              {
                number: "50K+",
                label: "Citizens Helped",
                sublabel: "Active users monthly",
                icon: Users,
                color: "from-blue-500 to-cyan-500",
                bgColor: "bg-blue-500/10"
              },
              {
                number: "25K+",
                label: "Legal Queries Resolved",
                sublabel: "Questions answered daily",
                icon: MessageCircle,
                color: "from-purple-500 to-pink-500",
                bgColor: "bg-purple-500/10"
              },
              {
                number: "12K+",
                label: "Reports Filed",
                sublabel: "Official complaints submitted",
                icon: FileText,
                color: "from-red-500 to-orange-500",
                bgColor: "bg-red-500/10"
              },
              {
                number: "98%",
                label: "Response Rate",
                sublabel: "Government follow-up",
                icon: Zap,
                color: "from-green-500 to-emerald-500",
                bgColor: "bg-green-500/10"
              }
            ].map((metric, index) => (
              <div key={index} className={`${metric.bgColor} backdrop-blur-lg rounded-2xl p-6 border border-white/10 text-center hover:scale-105 transition-all duration-300 group`}>
                <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{metric.number}</div>
                <div className="text-white font-semibold text-sm mb-1">{metric.label}</div>
                <div className="text-gray-400 text-xs">{metric.sublabel}</div>
              </div>
            ))}
          </div>

          {/* Additional Performance Metrics */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
                &lt; 30 sec
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Average Response Time</h3>
              <p className="text-gray-300 text-sm">Lightning-fast AI responses to legal queries with accurate article references</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                92%
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">User Satisfaction</h3>
              <p className="text-gray-300 text-sm">Citizens rate our platform highly for accuracy and ease of use</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 text-center">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 mb-2">
                28 States
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Coverage Area</h3>
              <p className="text-gray-300 text-sm">Comprehensive state-specific emergency contacts and legal information</p>
            </div>
          </div>
        </div>

        {/* Government Integration */}
        <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-lg rounded-3xl p-12 mb-20 border border-white/10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-8 lg:mb-0">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mr-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white">Government Integration</h2>
              </div>
              <p className="text-lg text-gray-300 leading-relaxed mb-6">
                Our platform maintains direct integration with government monitoring systems, 
                ensuring that citizen reports reach the appropriate authorities efficiently. 
                This creates a transparent feedback loop between citizens and government officials, 
                promoting accountability and rapid response to legal issues.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm text-gray-300">Live Government Connection</span>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 lg:pl-12">
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <Eye className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-2">24/7</div>
                  <div className="text-sm text-gray-400 mb-2">Monitoring</div>
                  <div className="text-xs text-indigo-300">Real-time oversight</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-2">100%</div>
                  <div className="text-sm text-gray-400 mb-2">Secure</div>
                  <div className="text-xs text-purple-300">End-to-end encryption</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <Phone className="w-8 h-8 text-green-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-2">15</div>
                  <div className="text-sm text-gray-400 mb-2">Departments</div>
                  <div className="text-xs text-green-300">Connected agencies</div>
                </div>
                <div className="bg-white/5 rounded-xl p-6 text-center">
                  <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-2">2.5 hrs</div>
                  <div className="text-sm text-gray-400 mb-2">Avg Response</div>
                  <div className="text-xs text-yellow-300">Official reply time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of citizens who have already empowered themselves with instant access to legal knowledge and government services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={handleChat} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl">
                Start Chatting
              </button>
              <button onClick={handleReport} className="bg-white/10 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
                File a Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;