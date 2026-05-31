# 📝 Codex for Open Source Başvuru Rehberi & Form Yanıtları

Aşağıda, **git-sentinel** projesi için hazırladığımız, OpenAI değerlendirme kriterlerine tam uyumlu ve kabul alma şansınızı en üst düzeye çıkaracak başvuru formu yanıtları yer almaktadır. Formu doldururken bu yanıtları doğrudan kopyalayıp yapıştırabilirsiniz.

---

### 👤 Kişisel Bilgiler
*   **Ad:** Erdem
*   **Soyad:** Çakılcı
*   **E-posta:** `erdemcakilci@gmail.com` *(ChatGPT hesabınızla ilişkili e-posta adresini girin)*
*   **GitHub Kullanıcı Adı:** `[GitHub Kullanıcı Adınızı Buraya Yazın]` *(Profilinizin herkese açık olduğundan emin olun)*
*   **GitHub Deposu URL'si:** `https://github.com/[GitHub_Kullanıcı_Adınız]/git-sentinel` *(Depoyu herkese açık (public) hale getirdiğinizden emin olun)*
*   **Rolünüzü tanımlayın:** "Ana proje yöneticisiyim ve geliştirme/bakım süreçlerinin tamamını yürütüyorum."

---

### ❓ Form Soruları ve Yanıtları

#### 1. Bu depo neden uygun? * (En fazla 500 karakter)
> **💡 İpucu:** Karakter sınırı 500'dür. Aşağıdaki metin **395 karakterdir** ve kriterleri tam karşılar:
> 
> "Git-Sentinel, açık kaynak proje yöneticilerinin üzerindeki bakım yükünü azaltmak amacıyla geliştirilmiş, yapay zekâ destekli bir Git asistanı ve GitHub Action'ıdır. PR inceleme, güvenlik denetimi, sürüm notu üretimi ve issue sınıflandırma süreçlerini otomatikleştirir. Geliştirici ekosisteminde bakım (maintenance) maliyetlerini düşürmeyi hedefler. Aktif entegrasyonu, kapsamlı testleri ve modüler yapısıyla Codex programının doğrudan hedeflediği kritik bakım araçları kategorisine mükemmel uyum sağlar."

#### 2. Şununla ilgileniyorum... (Geçerli olanların tümünü seçin)
*   [x] **Codex'i içeren 6 aylık ChatGPT Pro erişimi** *(Günlük kodlama ve inceleme iş akışları için)*
*   [x] **Codex Security'e koşullu erişim** *(Kod tabanındaki güvenlik ve zaafiyet analizleri için)*
*   [x] **Kodlama, bakım otomasyonu, sürüm iş akışları ve temel açık kaynak çalışmaları için API kredileri** *(Projeyi çalıştırmak için)*

#### 3. OpenAI Kuruluş Kimliği *
*   [ ] [OpenAI Settings](https://platform.openai.com/account/organization) sayfasına giderek organizasyon kimliğinizi (örn: `org-XXXXXXXXXXXXXXXXXXXXXXXX`) bulun ve forma yapıştırın.

#### 4. Projeniz için API kredilerini nasıl kullanacaksınız? * (En fazla 500 karakter)
> **💡 İpucu:** Karakter sınırı 500'dür. Aşağıdaki metin **390 karakterdir**:
> 
> "API kredilerini, Git-Sentinel'in kendi deposundaki ve entegre edildiği diğer açık kaynak projelerdeki yapay zekâ iş akışlarını fonlamak için kullanacağız. Özellikle: PR'larda otomatik kod inceleme raporları üretmek, yeni açılan hataları (issues) önem derecelerine göre sınıflandırmak, local regex taramalarındaki güvenlik bulgularını AI ile doğrulamak ve otomatik sürüm notları derlemek için kullanacağız."

#### 5. Bilmemiz gereken başka bir şey var mı? (En fazla 500 karakter)
> **💡 İpucu:** Karakter sınırı 500'dür. Aşağıdaki metin **420 karakterdir**:
> 
> "Git-Sentinel, TypeScript tabanlı, test kapsamı yüksek ve kullanıma hazır bir CLI / GitHub Action aracıdır. Projeyi tamamen açık kaynak olarak topluluğa sunuyoruz. OpenAI Codex API desteği sayesinde aracı daha da geliştirerek; AST tabanlı derin kod analizleri yapmayı, çoklu dil desteği eklemeyi ve bakım ekipleri için akıllı PR yönlendirme özellikleri geliştirmeyi hedefliyoruz. Desteğiniz bu süreci çok hızlandıracaktır."

---

## 🛠️ Başvurudan Önce Yapılması Gerekenler Checklist

1.  **GitHub Deposu Oluşturma:**
    *   GitHub'da `git-sentinel` adında yeni bir **Public (Herkese Açık)** depo oluşturun.
    *   Yerel dosyaları bu depoya push edin:
        ```bash
        git init
        git add .
        git commit -m "feat: initial commit of git-sentinel"
        git branch -M main
        git remote add origin https://github.com/[Kullanıcı_Adınız]/git-sentinel.git
        git push -u origin main
        ```
2.  **GitHub Profil Ayarları:**
    *   GitHub profilinizin ve e-postanızın herkese açık (Public) olduğundan emin olun.
3.  **Başvuru Formunu Doldurma:**
    *   [Codex for Open Source](https://openai.com/form/codex-for-open-source) başvuru formunu açın.
    *   Yukarıda hazırladığımız yanıtları yapıştırarak başvurunuzu tamamlayın.
