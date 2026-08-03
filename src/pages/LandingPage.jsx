import { useNavigate } from 'react-router-dom';

const Landing = () => {
      const navigate = useNavigate();

      return (
            <div className="bg-[#f7f9ff] text-[#181c20]">

                  {/* Navbar */}
                  <header className="bg-white sticky top-0 z-50 border-b border-[#c1c6d6]">
                        <nav className="flex justify-between items-center w-full px-6 py-4 max-w-[1440px] mx-auto">
                              <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#005bbf] text-3xl">domain</span>
                                    <span className="font-bold text-xl text-[#005bbf]">PropMaintain</span>
                              </div>
                              <div className="hidden md:flex gap-8 items-center">
                                    <a className="text-[#005bbf] font-bold border-b-2 border-[#005bbf] pb-1" href="#">Home</a>
                                    <a className="text-[#414754] hover:text-[#005bbf] transition-colors" href="#features">Features</a>
                                    <a className="text-[#414754] hover:text-[#005bbf] transition-colors" href="#about">About</a>
                                    <a className="text-[#414754] hover:text-[#005bbf] transition-colors" href="#contact">Contact</a>
                              </div>
                              <div className="flex items-center gap-4">
                                    <button
                                          className="text-[#005bbf] font-bold px-4 py-2 hover:bg-[#f1f4fa] rounded-lg transition-colors"
                                          onClick={() => navigate('/login')}>
                                          Login
                                    </button>
                                    <button
                                          className="bg-[#005bbf] text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-[#004493] transition-all active:scale-95"
                                          onClick={() => navigate('/register')}>
                                          Register
                                    </button>
                              </div>
                        </nav>
                  </header>

                  {/* Hero Section */}
                  <section className="relative bg-[#f7f9ff] overflow-hidden py-24 md:py-32">
                        <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                              <div className="z-10">
                                    <h1 className="text-4xl md:text-[56px] md:leading-[64px] font-bold text-[#181c20] mb-4">
                                          Efficient Property Maintenance Made Simple
                                    </h1>
                                    <p className="text-lg text-[#414754] mb-8 max-w-xl">
                                          Manage maintenance requests, assign technicians, track repairs, and improve tenant satisfaction across your Nigerian residential portfolio.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                          <button
                                                className="bg-[#005bbf] text-white px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:bg-[#004493] transition-all active:scale-95"
                                                onClick={() => navigate('/register')}>
                                                Get Started
                                          </button>
                                          <button
                                                className="border-2 border-[#005bbf] text-[#005bbf] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#d8e2ff] transition-all active:scale-95"
                                                onClick={() => navigate('/login')}>
                                                Learn More
                                          </button>
                                    </div>
                              </div>
                              <div className="relative flex items-center justify-center">
                                    <div className="absolute inset-0 bg-[#1a73e8]/10 rounded-full blur-3xl"></div>
                                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 border border-[#c1c6d6] w-full">
                                          <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-lg bg-[#005bbf] flex items-center justify-center text-white">
                                                      <span className="material-symbols-outlined">business_center</span>
                                                </div>
                                                <span className="font-bold text-[#005bbf] text-lg">PropMaintain Dashboard</span>
                                          </div>
                                          <div className="grid grid-cols-2 gap-4 mb-4">
                                                {[
                                                      { label: 'Total Requests', value: '412', color: 'text-[#181c20]', bg: 'bg-[#d8e2ff]', icon: 'assignment' },
                                                      { label: 'Pending', value: '28', color: 'text-amber-600', bg: 'bg-yellow-100', icon: 'hourglass_empty' },
                                                      { label: 'In Progress', value: '114', color: 'text-[#005ac1]', bg: 'bg-[#d8e2ff]', icon: 'sync' },
                                                      { label: 'Completed', value: '270', color: 'text-green-600', bg: 'bg-green-100', icon: 'check_circle' },
                                                ].map((stat, i) => (
                                                      <div key={i} className="bg-[#f7f9ff] rounded-xl p-4 border border-[#c1c6d6]">
                                                            <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                                                                  <span className="material-symbols-outlined text-sm text-[#005bbf]">{stat.icon}</span>
                                                            </div>
                                                            <p className="text-xs text-[#414754] uppercase font-semibold">{stat.label}</p>
                                                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                                      </div>
                                                ))}
                                          </div>
                                          <div className="bg-[#005bbf] rounded-xl p-4 text-white">
                                                <p className="text-sm font-bold mb-1">Latest Request</p>
                                                <p className="text-xs opacity-90">Leaking pipe in Apartment 4B — High Priority</p>
                                                <span className="mt-2 inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-bold">In Progress</span>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </section>

                  {/* Features Section */}
                  <section className="py-24 bg-[#f1f4fa]" id="features">
                        <div className="max-w-[1280px] mx-auto px-6">
                              <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold text-[#181c20]">Our Core Features</h2>
                                    <div className="w-20 h-1.5 bg-[#005bbf] mx-auto mt-2 rounded-full"></div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                    {[
                                          { icon: 'assignment', title: 'Maintenance Request Submission', desc: 'Simple digital forms for tenants to report issues instantly.' },
                                          { icon: 'grading', title: 'Work Order Tracking', desc: 'Real-time status updates from pending to completion.' },
                                          { icon: 'engineering', title: 'Technician Assignment', desc: 'Smart dispatching to qualified local maintenance personnel.' },
                                          { icon: 'payments', title: 'Cost Tracking', desc: 'Audit-ready records of repair expenses and material costs.' },
                                          { icon: 'assessment', title: 'Reports and Analytics', desc: 'Data-driven insights to optimize property lifecycle value.' },
                                    ].map((feature, i) => (
                                          <div key={i} className="bg-white rounded-xl p-6 flex flex-col items-center text-center border border-[#c1c6d6] hover:shadow-lg transition-all hover:-translate-y-1">
                                                <div className="w-16 h-16 bg-[#d8e2ff] rounded-full flex items-center justify-center mb-4">
                                                      <span className="material-symbols-outlined text-[#005bbf] text-3xl">{feature.icon}</span>
                                                </div>
                                                <h3 className="font-bold text-[#181c20] mb-2">{feature.title}</h3>
                                                <p className="text-sm text-[#414754]">{feature.desc}</p>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </section>

                  {/* User Roles Section */}
                  <section className="py-24 bg-white" id="about">
                        <div className="max-w-[1280px] mx-auto px-6">
                              <div className="text-center mb-12">
                                    <h2 className="text-3xl font-bold text-[#181c20]">Who is it for?</h2>
                                    <p className="text-[#414754] mt-2">Tailored experiences for every stakeholder in the ecosystem.</p>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[
                                          { icon: 'person', role: 'Tenant', num: '01', desc: 'Submit requests and track progress. Receive notifications when work is scheduled or finished.' },
                                          { icon: 'manage_accounts', role: 'Property Manager', num: '02', desc: 'Oversee all tasks and assign work. Review technician performance and approve maintenance.' },
                                          { icon: 'build', role: 'Technician', num: '03', desc: 'Receive and update work orders. Upload completion photos and report material usage on the go.' },
                                          { icon: 'admin_panel_settings', role: 'Admin', num: '04', desc: 'Manage system settings and users. Configure property portfolios and oversee the system.' },
                                    ].map((item, i) => (
                                          <div key={i} className="group bg-white border border-[#c1c6d6] rounded-xl p-6 hover:bg-[#005bbf] transition-colors duration-300 cursor-pointer">
                                                <div className="mb-6 flex justify-between items-start">
                                                      <span className={`material-symbols-outlined text-4xl text-[#005bbf] group-hover:text-white`}>{item.icon}</span>
                                                      <span className="bg-[#d8e2ff] text-[#005bbf] text-xs px-3 py-1 rounded-full font-bold group-hover:bg-white/20 group-hover:text-white">Role {item.num}</span>
                                                </div>
                                                <h3 className="font-bold text-lg text-[#181c20] group-hover:text-white mb-2">{item.role}</h3>
                                                <p className="text-sm text-[#414754] group-hover:text-white/80">{item.desc}</p>
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </section>

                  {/* CTA Section */}
                  <section className="py-24 bg-[#005bbf] text-white">
                        <div className="max-w-[1280px] mx-auto px-6 text-center">
                              <h2 className="text-3xl font-bold mb-4">Ready to modernize your property management?</h2>
                              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                                    Join hundreds of Nigerian residential estates using PropMaintain to preserve their facility value and keep tenants happy.
                              </p>
                              <div className="flex justify-center gap-4">
                                    <button
                                          className="bg-white text-[#005bbf] px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:bg-[#d8e2ff] transition-all active:scale-95"
                                          onClick={() => navigate('/register')}>
                                          Create Account
                                    </button>
                                    <button
                                          className="border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all active:scale-95"
                                          onClick={() => navigate('/login')}>
                                          Login
                                    </button>
                              </div>
                        </div>
                  </section>

                  {/* Footer */}
                  <footer className="bg-[#f1f4fa] border-t border-[#c1c6d6]" id="contact">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full px-6 py-12 max-w-[1440px] mx-auto">
                              <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                          <span className="material-symbols-outlined text-[#005bbf]">domain</span>
                                          <span className="font-bold text-[#181c20]">PropMaintain</span>
                                    </div>
                                    <p className="text-sm text-[#414754]">The standard for property maintenance management in Nigeria.</p>
                                    <p className="text-sm text-[#414754] opacity-80">© 2024 PropMaintain. All rights reserved.</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                    <div>
                                          <h4 className="text-xs font-bold text-[#005bbf] uppercase mb-3">Links</h4>
                                          <ul className="space-y-2">
                                                {['About', 'Contact', 'Terms of Service', 'Privacy Policy'].map(link => (
                                                      <li key={link}>
                                                            <a className="text-sm text-[#414754] hover:text-[#005bbf] transition-colors" href="#">{link}</a>
                                                      </li>
                                                ))}
                                          </ul>
                                    </div>
                                    <div>
                                          <h4 className="text-xs font-bold text-[#005bbf] uppercase mb-3">Social</h4>
                                          <ul className="space-y-2">
                                                {['Twitter', 'LinkedIn', 'Instagram'].map(social => (
                                                      <li key={social}>
                                                            <a className="text-sm text-[#414754] hover:text-[#005bbf] transition-colors" href="#">{social}</a>
                                                      </li>
                                                ))}
                                          </ul>
                                    </div>
                              </div>
                              <div className="space-y-4">
                                    <h4 className="text-xs font-bold text-[#005bbf] uppercase">Newsletter</h4>
                                    <div className="flex gap-2">
                                          <input
                                                className="bg-white border border-[#c1c6d6] rounded-lg px-4 py-2 w-full text-sm focus:ring-1 focus:ring-[#005bbf] outline-none"
                                                placeholder="Email address"
                                                type="email"
                                          />
                                          <button className="bg-[#005bbf] text-white px-4 py-2 rounded-lg hover:bg-[#004493] transition-all font-bold">
                                                Join
                                          </button>
                                    </div>
                              </div>
                        </div>
                  </footer>
            </div>
      );
};

export default Landing;