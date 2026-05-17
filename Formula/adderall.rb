class Adderall < Formula
  desc "Keep a Mac awake for a duration"
  homepage "https://github.com/zaydek/homebrew-tap"
  url "https://github.com/zaydek/homebrew-tap/releases/download/adderall-v0.1.0/adderall-darwin-arm64.tar.gz"
  sha256 "ee5233a5ee6b4fbe22ecf289cfa6046f53633e127fe272682f2a8556b3e8afb8"
  version "0.1.0"
  license :cannot_represent

  depends_on :macos
  depends_on macos: :ventura
  depends_on arch: :arm64

  def install
    bin.install "bin/adderall"
    bin.install_symlink "adderall" => "add"
    quiet_system "xattr", "-d", "com.apple.quarantine", bin/"adderall"
  end

  def caveats
    <<~EOS
      Run once after install:
        adderall install
        adderall doctor
    EOS
  end

  test do
    assert_match "adderall", shell_output("#{bin}/adderall --help 2>&1")
  end
end
